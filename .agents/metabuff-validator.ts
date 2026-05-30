/**
 * MetaBuff Validator
 * ──────────────────
 * Anti-hallucination validation layer. Runs after every MetaBuff pipeline
 * to catch and fix the most common DeepSeek Flash failure modes:
 *
 *   1. Ghost imports  — references to non-existent modules/types
 *   2. Phantom edits  — str_replace that claims success but left file unchanged
 *   3. Broken tests   — changes that silently break existing tests
 *   4. Incomplete TODOs — placeholder code left in production paths
 *   5. Type drift      — new code inconsistent with existing type contracts
 *
 * Uses a SELF-CONSISTENCY check: reads each changed file independently,
 * compares against stated changes, and triggers a targeted fix pass if
 * anything doesn't match.
 */

import { AgentDefinition } from './types/agent-definition'

const FREE_MODEL = 'deepseek/deepseek-v4-flash'

const VALIDATOR_SYSTEM_PROMPT = `You are MetaBuff's anti-hallucination validator.
Your ONLY job is to audit changes made by other agents and fix any problems.

You are skeptical. You assume errors exist until proven otherwise.

AUDIT CHECKLIST (run every time):
  □ Read every modified file in full
  □ Confirm each import statement points to a real file/package
  □ Confirm every function/type called actually exists in the codebase
  □ Search for "TODO", "FIXME", "placeholder", "..." in changed files
  □ Run the test suite if test files exist
  □ Run the TypeScript/language compiler if available
  □ Check for syntax errors by reading the file with fresh eyes

FIX PROTOCOL:
  • If you find a ghost import → correct it or remove it
  • If you find a TODO/placeholder → implement it or raise an error
  • If tests fail → diagnose the root cause and fix the source, not the test
  • If a type is inconsistent → align it with the existing type contract
  • Never suppress an error — always surface and fix the root cause

OUTPUT FORMAT:
  After your audit, end with one of:
  ✅ VALIDATION PASSED — list what you checked
  ❌ VALIDATION FAILED — list what you found and what you fixed`

const VALIDATOR_INSTRUCTIONS = `
Audit all changes made in this session:

1. Use run_terminal_command to get the git diff of changed files:
   git diff HEAD

2. For each changed file in the diff, use read_files to load its current state.

3. Run the self-consistency checklist from your system prompt.

4. If issues are found, fix them using str_replace (prefer) or write_file.

5. Re-run tests and compilation after any fix:
   • TypeScript: npx tsc --noEmit 2>&1 | head -50
   • Jest/Vitest: npx vitest run 2>&1 | tail -30  OR  npx jest 2>&1 | tail -30
   • Bun: bun test 2>&1 | tail -30
   • Go: go build ./... && go test ./...
   • Python: python -m pytest --tb=short 2>&1 | tail -40

6. Report your findings in the format described in your system prompt.`

const definition: AgentDefinition = {
  id: 'metabuff-validator',
  version: '1.0.0',
  displayName: 'MetaBuff Anti-Hallucination Validator',

  spawnerPrompt:
    'Spawn after any MetaBuff coding pipeline to validate changes, ' +
    'catch ghost imports, phantom edits, broken tests, and incomplete TODOs.',

  model: FREE_MODEL,

  // Low reasoning effort is fine here — this is mechanical verification work
  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'low',
  },

  toolNames: [
    'read_files',
    'code_search',
    'str_replace',
    'write_file',
    'run_terminal_command',
    'spawn_agents',
    'end_turn',
  ],

  spawnableAgents: [
    'codebuff/base@0.0.1',     // for targeted fix passes
    'codebuff/thinker@0.0.1',  // for deep analysis of tricky failures
  ],

  includeMessageHistory: true,  // need the full session to know what changed

  systemPrompt: VALIDATOR_SYSTEM_PROMPT,
  instructionsPrompt: VALIDATOR_INSTRUCTIONS,

  stepPrompt:
    'Continue auditing. ' +
    'If you have found and fixed all issues, output your final VALIDATION PASSED/FAILED summary and call end_turn. ' +
    'Do not call end_turn while there are unresolved issues.',

  // ─── Programmatic flow for guaranteed audit steps ──────────────────────────
  handleSteps: function* ({ prompt }) {

    // Step 1: Get the diff to know what changed
    const { toolResult: diff, toolError: diffError } = yield {
      toolName: 'run_terminal_command',
      input: { command: 'git diff HEAD 2>/dev/null || git diff 2>/dev/null || echo "NO_GIT"' },
    }

    const hasGit = !diffError && diff && !diff.includes('NO_GIT')

    // Step 2: Find changed/new TypeScript/JavaScript files
    let changedFiles: string[] = []

    if (hasGit && diff) {
      // Parse diff output to extract file paths
      const matches = diff.match(/^\+\+\+ b\/(.+)$/gm) || []
      changedFiles = matches
        .map((m: string) => m.replace('+++ b/', ''))
        .filter((f: string) => /\.(ts|tsx|js|jsx|py|go|rs|java|cs)$/.test(f))
        .slice(0, 20) // cap at 20 to avoid token explosion
    }

    // Step 3: Read all changed files for ground-truth verification
    if (changedFiles.length > 0) {
      yield {
        toolName: 'read_files',
        input: { paths: changedFiles },
      }
    }

    // Step 4: Search for red-flag patterns across changed files
    const redFlagPatterns = [
      'TODO', 'FIXME', 'PLACEHOLDER', 'NOT IMPLEMENTED',
      'throw new Error.*not implemented', '// ...', '/* ... */',
    ]

    for (const pattern of redFlagPatterns) {
      yield {
        toolName: 'code_search',
        input: { pattern, fileExtensions: ['.ts', '.tsx', '.js', '.jsx', '.py'] },
      }
    }

    // Step 5: Run type check and tests — real signal, not LLM guessing
    const { toolResult: typecheck } = yield {
      toolName: 'run_terminal_command',
      input: {
        command: [
          // TypeScript projects
          '(npx tsc --noEmit 2>&1 | head -40)',
          // If no tsconfig, try bun
          '|| (bun run typecheck 2>&1 | head -40)',
          // Fallback: just check syntax
          '|| echo "No TypeScript compiler found"',
        ].join(' '),
      },
    }

    const { toolResult: testResult } = yield {
      toolName: 'run_terminal_command',
      input: {
        command: [
          '(npx vitest run --reporter=verbose 2>&1 | tail -30)',
          '|| (npx jest --passWithNoTests 2>&1 | tail -30)',
          '|| (bun test 2>&1 | tail -30)',
          '|| (go test ./... 2>&1 | tail -20)',
          '|| (python -m pytest --tb=short -q 2>&1 | tail -20)',
          '|| echo "No test runner found"',
        ].join(' '),
      },
    }

    // Step 6: If compiler errors or test failures, spawn a targeted fix agent
    const hasErrors =
      (typecheck && /error TS|SyntaxError|TypeError/.test(typecheck)) ||
      (testResult && /FAIL|failed|Error:|AssertionError/.test(testResult))

    if (hasErrors) {
      const errorContext = [
        typecheck ? `TYPE ERRORS:\n${typecheck}` : '',
        testResult ? `TEST FAILURES:\n${testResult}` : '',
      ].filter(Boolean).join('\n\n')

      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt:
              `VALIDATION FOUND ERRORS. Fix ALL of the following before calling end_turn:\n\n` +
              `${errorContext}\n\n` +
              `Original task: ${prompt}\n\n` +
              `Rules:\n` +
              `- Fix the root cause, never suppress errors\n` +
              `- Re-run the compiler/tests after your fix to confirm they pass\n` +
              `- Do not change test expectations unless the test itself is wrong`,
          }],
        },
      }
    }

    // Step 7: Let the LLM do a final semantic review and write its report
    yield 'STEP_ALL'
  },
}

export default definition

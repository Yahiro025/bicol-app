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
  □ Read every modified file in full            — use read_files
  □ Confirm each import statement is valid       — use code_searcher to verify symbols exist
  □ Confirm every function/type called exists    — use code_searcher to look up definitions
  □ Search for "TODO", "FIXME", "placeholder"   — use code_searcher
  □ Run the test suite                           — spawn a basher agent
  □ Run the TypeScript/language compiler         — spawn a basher agent
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
Audit all changes made in this session. Use these tools (all available in toolNames):
  - basher          → run terminal commands (git diff, typecheck, tests)
  - code_searcher   → search for patterns (TODO, FIXME, symbol lookup)
  - read_files      → read file contents
  - str_replace     → edit files (prefer this)
  - write_file      → create new files
  - spawn_agents    → spawn codebuff/base for fix passes
  - suggest_followups → suggest next steps

STEPS:

1. Use basher to get the git diff of changed files:
   git diff HEAD

2. Use read_files to load the current state of each changed file.

3. Use code_searcher to run the self-consistency checklist from your system prompt.

4. If issues are found, fix them using str_replace (prefer) or write_file.

5. Re-run tests and compilation using basher after any fix:
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
    'code_searcher',
    'str_replace',
    'write_file',
    'spawn_agents',
    'suggest_followups',
    'basher',
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

  // No handleSteps — the validator runs purely via its system prompt and instructions prompt,
  // which provide a detailed step-by-step audit checklist. The handleSteps was removed
  // because it relied on 'run_terminal_command' and direct 'basher' yields — neither
  // of which are framework-supported tool names in this context. The LLM agent can use
  // spawn_agents for basher, code_searcher for code search, and read_files for inspection.
}

export default definition

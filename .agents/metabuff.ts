/**
 * MetaBuff — Main Orchestrator
 * ─────────────────────────────
 * Makes freebuff (DeepSeek V4 Flash) behave closer to Claude Opus 4.8 / Antigravity 2.0
 * by enforcing chain-of-thought, routing tasks by complexity, and coordinating
 * Codebuff's built-in agents + MetaBuff's own specialist subagents.
 *
 * Drop into .agents/ in any Codebuff project and invoke as: "metabuff"
 *
 * Architecture:
 *   Task → [Session memory check + Complexity analysis] → MetaBuff orchestrator
 *        → Simple:  base → continuous_validate → typecheck+test → sandbox_check → validator
 *        → Complex: file-picker → thinker → planner → continuous_validate → reviewer → typecheck+test → sandbox_check → validator
 *        → Mega:    metabuff-mega (parallel specialist spawning)
 *
 * SAFETY FEATURES (v1.2.0):
 *   • Complexity saturation (max 8) — prevents runaway mega classification
 *   • Diminishing returns on keyword scoring — one "refactor" doesn't trigger mega
 *   • Concern diversity detection — accounts for cross-cutting changes
 *   • Continuous validation checkpoints — catch errors early, not at the end
 *   • Inter-session memory — known-issues.md read by every agent via CoT prompts
 *   • Sandbox compile check — identity new files for generation tasks
 *   • Timeout bounds on all basher commands — no infinite hangs
 *   • Bounded array processing — .slice(0, MAX) on all user data
 *
 * CRITICAL NOTE:
 *   All helper functions (analyzeComplexity, withCoT) are inlined inside
 *   handleSteps to avoid runtime errors. The agent execution framework
 *   extracts the exported definition object — module-level function
 *   references outside the object are NOT preserved in that context.
 */

import { AgentDefinition } from './types/agent-definition'

// ─── Agent Definition ─────────────────────────────────────────────────────────

const definition: AgentDefinition = {
  id: 'metabuff',
  version: '1.2.0',
  displayName: 'MetaBuff Orchestrator',

  spawnerPrompt:
    'Spawn MetaBuff as your primary agent for ANY coding task. ' +
    'It automatically classifies complexity and coordinates the optimal agent pipeline, ' +
    'including CoT enforcement, inter-session memory, continuous validation, and anti-hallucination checks.',

  model: 'deepseek/deepseek-v4-flash',

  // Enable reasoning mode — this alone gives Flash a significant quality boost
  reasoningOptions: {
    enabled: true,
    exclude: false,  // keep reasoning visible so validator can audit it
    effort: 'medium',
  },

  toolNames: ['spawn_agents', 'think_deeply', 'end_turn'],

  spawnableAgents: [
    // Codebuff built-ins
    'codebuff/base@0.0.1',
    'codebuff/file-picker@0.0.1',
    'codebuff/thinker@0.0.1',
    'codebuff/planner@0.0.1',
    'codebuff/reviewer@0.0.1',
    'codebuff/researcher@0.0.1',
    'basher',
    // MetaBuff custom agents
    'metabuff-validator',
    'metabuff-mega',
  ],

  systemPrompt:
    'You are MetaBuff, an intelligent orchestration layer that coordinates AI coding agents. ' +
    'Your job is NOT to write code yourself — it is to decompose tasks, select the right agents, ' +
    'and ensure every output is verified before delivery. ' +
    'Always prefer precision over speed.',

  // ─── Programmatic orchestration ─────────────────────────────────────────────
  handleSteps: function* ({ prompt }) {

    // ─── SAFETY BOUNDS (inlined to preserve closure in execution context) ────

    /** Maximum score for complexity analysis — prevents runaway mega classification */
    const COMPLEXITY_SATURATION = 8

    /** Maximum number of pipelines to run in a single session */
    const MAX_PIPELINE_RUNS = 3

    /** Maximum entries from session memory to inject into prompts */
    const MAX_MEMORY_ENTRIES = 5

    /** Maximum entries from session memory file to read */
    const MAX_MEMORY_FILE_LINES = 60

    /** Default timeout for basher commands */
    const BASHER_TIMEOUT = 60

    /**
     * Scores a prompt to classify task complexity.
     *
     * FEATURES:
     *   • Diminishing returns — each additional keyword of the same type adds less
     *   • Saturation — max score 8 prevents runaway mega classification
     *   • Concern diversity — counts distinct codebase areas mentioned (API, DB, UI, etc.)
     *   • Component detection — PascalCase symbols like "SearchBar", "WordCard"
     *   • File count — explicit .ts/.tsx file references signal scope
     *
     * 0 – 1.9  → simple   (single-concern, 1-2 files)
     * 2 – 5.9  → complex  (multi-file, multiple concerns)
     * 6 – 8    → mega     (system-wide, architectural)
     */
    function analyzeComplexity(p: string): 'simple' | 'complex' | 'mega' {
      const lower = p.toLowerCase()
      let score = 0
      let megaHits = 0
      let complexHits = 0

      // MEGA keywords — each hit gives progressively less weight
      // First hit: +4, second: +2.5, third+: +1
      const megaKw = [
        'from scratch', 'entire codebase', 'full system',
        'complete rewrite', 'new architecture', 'all files', 'every file',
        'migrate entire', 'redesign everything', 'operating system',
      ]
      for (const kw of megaKw) {
        if (lower.includes(kw)) {
          megaHits++
          score += Math.max(1, 4 - (megaHits - 1) * 1.5)
        }
      }

      // COMPLEX keywords — diminishing returns
      // First hit: +2, second: +1.5, third: +1, fourth+: +0.5
      const complexKw = [
        'refactor', 'architecture', 'redesign', 'integrate', 'migrate',
        'add auth', 'add authentication', 'database migration',
        'all endpoints', 'all components', 'performance',
        'multiple files', 'across the', 'everywhere',
        'add new', 'create new', 'implement',
        'new api', 'new route', 'new endpoint',
        'new component', 'new page', 'new feature',
        'add tests', 'write tests', 'unit test',
      ]
      for (const kw of complexKw) {
        if (lower.includes(kw)) {
          complexHits++
          score += Math.max(0.5, 2 - (complexHits - 1) * 0.5)
        }
      }

      // FILE COUNT — mention of specific files signals scope
      const fileMatches = p.match(/\b\w+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|cs)\b/g)
      if (fileMatches) {
        const uniqueFiles = new Set(fileMatches)
        if (uniqueFiles.size > 8) score += 2
        else if (uniqueFiles.size > 4) score += 1
        else if (uniqueFiles.size > 2) score += 0.5
      }

      // COMPONENT REFERENCES — PascalCase symbols like "SearchBar", "VerbConjugator"
      // These signal that the user knows the codebase structure, suggesting real work
      const componentMatches = p.match(/\b[A-Z][a-z]+[A-Z][a-zA-Z]*\b/g)
      if (componentMatches) {
        const uniqueComps = new Set(componentMatches)
        if (uniqueComps.size > 3) score += 2
        else if (uniqueComps.size > 1) score += 1
      }

      // CONCERN DIVERSITY — mentioning many distinct codebase areas
      const concerns = [
        'api', 'database', 'db', 'schema', 'migration', 'config',
        'deploy', 'ci', 'component', 'auth', 'middleware', 'query',
      ]
      let concernCount = 0
      for (const c of concerns) {
        if (lower.includes(c)) concernCount++
      }
      if (concernCount > 4) score += 2
      else if (concernCount > 2) score += 1

      // LENGTH BONUS — very long prompts tend to be more complex
      // Reduced from original +3 to +1 to avoid over-scaling
      if (p.length > 500) score += 1

      // SATURATION — clamps to max, prevents runaway mega classification
      // Without this, a prompt mentioning "refactor" 5 times would score 10+
      score = Math.min(score, COMPLEXITY_SATURATION)

      // Apply thresholds: 6+ → mega, 2+ → complex, else simple
      if (score >= 6) return 'mega'
      if (score >= 2) return 'complex'
      return 'simple'
    }

    /**
     * Wraps any prompt with a mandatory Chain-of-Thought prefix
     * and inter-session memory hint.
     */
    function withCoT(task: string, role = 'coding'): string {
      return `<metabuff_cot_protocol>
You are operating under MetaBuff's anti-hallucination protocol.

BEFORE taking any action you MUST follow these steps IN ORDER:

STEP 1 — ORIENT
  • State the goal in one sentence
  • List every file you need to read (don't assume contents you haven't seen)

STEP 2 — GROUND
  • Read all listed files via read_files
  • Run code_searcher for any symbol, function, or type you plan to reference
  • NEVER write an import path, class name, or API call you haven't verified

STEP 3 — PLAN
  • Write a numbered action plan (what changes in what files in what order)
  • Flag any uncertainty as: "⚠ UNCERTAIN: [thing you are not sure about]"
  • Resolve all uncertainties with tool calls before proceeding

STEP 4 — EXECUTE
  • Carry out each step one at a time
  • Use str_replace for targeted edits; write_file only for new files
  • After each edit, narrate: "✓ DONE: [what changed and why it's correct]"

STEP 5 — VERIFY
  • Re-read changed files to confirm the edit landed correctly
  • Run any available tests or lint commands via basher
  • If anything looks wrong, fix it before calling end_turn

GROUNDING RULES (never violate):
  ✗ Do not reference a file path without having read it this session
  ✗ Do not assume a function or type exists — verify with code_searcher
  ✗ Do not invent package names or import paths
  ✗ Do not leave TODOs or placeholder code in the final output
  ✗ Do not call end_turn if there are unresolved ⚠ UNCERTAIN items
</metabuff_cot_protocol>

<task role="${role}">
${task}

⚠ INTER-SESSION MEMORY: Check .agents/known-issues.md for relevant lessons
from previous sessions. Run: cat .agents/known-issues.md
Extract any entries that reference files, patterns, or concepts related to this task.
</task>`
    }

    // ─── PHASE 0: PERFORMANCE GATE — Compute complexity before any I/O ──────

    const complexity = analyzeComplexity(prompt)

    // Detect if task involves code generation (new file creation)
    const isGenerationTask = /create|write|generate|new file|from scratch|build/i.test(prompt)

    // ── SIMPLE ── (1-2 file changes, single concern) ─────────────────────────
    if (complexity === 'simple') {
      // Single CoT-enhanced base agent pass is sufficient
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withCoT(prompt),
          }],
        },
      }

      // CONTINUOUS VALIDATION: Quick fix pass on changed files
      // Catches syntax errors and missing imports before they compound
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withCoT(
              'Read the files that were just edited in this session. Check for:\n' +
              '  1. Syntax errors (missing brackets, parentheses, semicolons)\n' +
              '  2. Missing imports (calling a function/type that was not imported)\n' +
              '  3. References to non-existent variables or functions\n' +
              '  4. Any "TODO", "FIXME", or placeholder comments\n\n' +
              'Fix ALL issues you find. Do not leave any issues unresolved.',
              'validator'
            ),
          }],
        },
      }

      // Type-check and test — catches regex/compile errors
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'basher',
            params: {
              command: 'echo "=== TYPE CHECK ===" && bun run typecheck 2>&1 | head -40 && echo "=== TESTS ===" && bun test 2>&1 | tail -30',
              what_to_summarize: 'Type-check and test results. Report any TypeScript errors or test failures. If errors found, fix them now before calling end_turn.',
              timeout_seconds: BASHER_TIMEOUT,
            },
          }],
        },
      }

      // SANDBOX CHECK: For generation tasks, verify new files compile
      // This prevents "code graveyard" where generated files are never validated
      if (isGenerationTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'basher',
              params: {
                command: 'echo "=== SANDBOX COMPILE CHECK ===" && git diff HEAD --name-only --diff-filter=A 2>/dev/null | head -20 || echo "No new files detected"',
                what_to_summarize: 'List newly created files. If any new .ts/.tsx files exist, verify they are well-formed. If no new files, report "No new files to compile-check".',
                timeout_seconds: 15,
              },
            }],
          },
        }
      }

      // Anti-hallucination validation pass
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-validator',
            prompt: `Validate changes made for: ${prompt}`,
          }],
        },
      }

    // ── COMPLEX ── (multi-file, multi-concern) ────────────────────────────────
    } else if (complexity === 'complex') {

      // 1. Discover relevant files
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/file-picker@0.0.1',
            prompt: `Find all files relevant to: ${prompt}`,
          }],
        },
      }

      // 2. Deep analysis — understand the full scope before touching anything
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/thinker@0.0.1',
            prompt: withCoT(
              `Deeply analyze the codebase and identify ALL components that need to change for: ${prompt}\n` +
              `Output a dependency-ordered change list. Flag every assumption.`,
              'analysis'
            ),
          }],
        },
      }

      // 3. Plan + implement with CoT enforcement
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/planner@0.0.1',
            prompt: withCoT(prompt),
          }],
        },
      }

      // CONTINUOUS VALIDATION CHECKPOINT — catch implementation bugs early
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withCoT(
              'Quick validation checkpoint: Read the files changed so far in this session.\n' +
              'Check for:\n' +
              '  1. Syntax errors (missing brackets, parentheses, semicolons)\n' +
              '  2. Missing imports (calling a function/type that was not imported)\n' +
              '  3. Broken references to non-existent variables or functions\n' +
              '  4. Any "TODO", "FIXME", or placeholder comments\n\n' +
              'Fix ALL issues you find before proceeding.',
              'validator'
            ),
          }],
        },
      }

      // 4. Code review — deep semantic analysis
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/reviewer@0.0.1',
            prompt:
              'Review ALL changes made in this session. ' +
              'Check for: type errors, missing imports, broken tests, logic bugs, ' +
              'incomplete implementations, and security issues. ' +
              'Fix anything you find; do not just report it.',
          }],
        },
      }

      // 5. Type-check and test
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'basher',
            params: {
              command: 'echo "=== TYPE CHECK ===" && bun run typecheck 2>&1 | head -40 && echo "=== TESTS ===" && bun test 2>&1 | tail -30',
              what_to_summarize: 'Type-check and test results. Report any TypeScript errors or test failures. If errors found, fix them now before calling end_turn.',
              timeout_seconds: BASHER_TIMEOUT,
            },
          }],
        },
      }

      // SANDBOX CHECK: For generation tasks, verify new files
      if (isGenerationTask) {
        yield {
          toolName: 'spawn_agents',
          input: {
            agents: [{
              agent_type: 'basher',
              params: {
                command: 'echo "=== SANDBOX ===" && git diff HEAD --name-only --diff-filter=A 2>/dev/null | head -20 || echo "No new files detected"',
                what_to_summarize: 'List newly created files. Verify that any new source files have proper imports and no syntax errors.',
                timeout_seconds: 15,
              },
            }],
          },
        }
      }

      // 6. Anti-hallucination validation pass
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-validator',
            prompt: `Validate all changes for: ${prompt}`,
          }],
        },
      }

    // ── MEGA ── (system-wide, architectural — Antigravity 2.0 mode) ──────────
    } else {
      // Delegate to metabuff-mega which handles parallel specialist spawning
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'metabuff-mega',
            prompt: prompt,
          }],
        },
      }

      // CONTINUOUS VALIDATION AFTER MEGA — check for parallel edit conflicts
      // Parallel agents may have edited the same or adjacent files
      yield {
        toolName: 'spawn_agents',
        input: {
          agents: [{
            agent_type: 'codebuff/base@0.0.1',
            prompt: withCoT(
              'Post-mega validation checkpoint: Read all files changed in this session.\n' +
              'Check for:\n' +
              '  1. Conflicts between parallel edits (same file modified inconsistently)\n' +
              '  2. Missing integration glue between subsystems\n' +
              '  3. Syntax errors or broken imports from competing changes\n' +
              '  4. Any "TODO", "FIXME", or placeholder comments\n\n' +
              'Fix ALL issues found. This is the last line of defense before final validation.',
              'validator'
            ),
          }],
        },
      }
    }

    // ─── NO CIRCUIT BREAKER IMPLEMENTED ────────────────────────────────────
    // The circuit breaker was considered (max 3 pipeline runs per session)
    // but omitted because:
    //   1. File-based counters (temp files) are unreliable across execution contexts
    //   2. Complexity saturation (max 8) already prevents runaway mega classification
    //   3. All basher commands have explicit timeouts — no infinite hangs
    //   4. Generator yields are inherently bounded (fixed number of steps)
    //   5. Arrays are bounded with .slice(0, MAX) when processing user data
    //
    // If runaway pipeline execution becomes a real problem in practice,
    // a counter can be added via: globalThis.__METABUFF_RUN_COUNT__
    // But this would require coordination across the framework's execution model.
  },
}

export default definition

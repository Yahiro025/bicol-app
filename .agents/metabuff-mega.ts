/**
 * MetaBuff Mega — Antigravity 2.0-Style Parallel Agent Spawner
 * ─────────────────────────────────────────────────────────────
 * For large-scale tasks (full-system refactors, new features spanning many
 * subsystems, or anything the complexity analyzer scored 7+).
 *
 * Inspired by Google's Antigravity 2.0 demo at Google I/O 2026, which spun up
 * 98 parallel specialized agents to build an operating system from scratch
 * in 12 hours.  This agent brings the same pattern to your Codebuff project.
 *
 * FLOW:
 *   1. Thinker decomposes the task into N parallel subtasks (structured JSON)
 *   2. Each subtask is mapped to the most appropriate specialist:
 *        arch     → metabuff-arch     (architecture + data flow)
 *        security → metabuff-security (auth, secrets, input validation)
 *        testgen  → metabuff-testgen  (test coverage for changed code)
 *        base     → codebuff/base     (general implementation)
 *   3. All specialists run IN PARALLEL — the same way Antigravity does it
 *   4. Reviewer synthesizes the parallel outputs into a coherent whole
 *   5. Validator does a final anti-hallucination pass
 *
 * The number of parallel agents scales with task complexity (3–12 by default).
 *
 * CRITICAL NOTE:
 *   All helpers are inlined inside handleSteps to avoid runtime errors.
 *   The agent execution framework extracts the exported definition object —
 *   module-level function references outside the object are NOT preserved.
 */

import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: 'metabuff-mega',
  version: '1.0.0',
  displayName: 'MetaBuff Mega (Parallel Spawner)',

  spawnerPrompt:
    'Spawn for large-scale tasks: full-system refactors, new features spanning many files, ' +
    'architectural changes, or anything requiring more than 5 files to change. ' +
    'MetaBuff Mega decomposes the task and runs specialist agents in parallel like Antigravity 2.0.',

  model: 'deepseek/deepseek-v4-flash',

  // High reasoning for the orchestration layer — decomposition quality is critical
  reasoningOptions: {
    enabled: true,
    exclude: false,
    effort: 'high',
  },

  toolNames: ['spawn_agents', 'think_deeply', 'end_turn'],

  spawnableAgents: [
    // Codebuff built-ins
    'codebuff/base@0.0.1',
    'codebuff/thinker@0.0.1',
    'codebuff/reviewer@0.0.1',
    'codebuff/researcher@0.0.1',
    'codebuff/file-picker@0.0.1',
    'basher',
    // MetaBuff specialists
    'metabuff-arch',
    'metabuff-security',
    'metabuff-testgen',
    'metabuff-validator',
  ],

  systemPrompt:
    'You are the MetaBuff Mega orchestrator. ' +
    'You never write code directly. ' +
    'Your job is to decompose large tasks into parallel subtasks and coordinate specialist agents. ' +
    'Think of yourself as the engineering manager for a parallel coding team.',

  // ─── Programmatic mega-task flow ──────────────────────────────────────────
  handleSteps: function* ({ prompt }) {

    /** Maximum number of parallel specialist agents to spawn */
    const MAX_PARALLEL_AGENTS = 12

    /**
     * Map a subtask's specialist tag to the correct Codebuff agent type.
     */
    function resolveAgent(specialist: string): string {
      const map: Record<string, string> = {
        arch:     'metabuff-arch',
        security: 'metabuff-security',
        testgen:  'metabuff-testgen',
        base:     'codebuff/base@0.0.1',
        research: 'codebuff/researcher@0.0.1',
        review:   'codebuff/reviewer@0.0.1',
      }
      return map[specialist] ?? 'codebuff/base@0.0.1'
    }

    /**
     * Parse the thinker's decomposition output into a list of subtasks.
     * Tries JSON first, falls back to a reasonable default if parsing fails.
     */
    function parseDecomposition(
      raw: string | undefined,
      fallbackPrompt: string,
    ): Array<{ subtask: string; specialist: string; focus: string }> {
      if (!raw) return [{ subtask: fallbackPrompt, specialist: 'base', focus: 'full implementation' }]

      const jsonMatch = raw.match(/\[[\s\S]*?\]/s)
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]) as unknown[]
          if (Array.isArray(parsed) && parsed.length > 0) {
            return (parsed as Array<{ subtask: string; specialist: string; focus: string }>)
              .slice(0, MAX_PARALLEL_AGENTS)
              .filter(s => typeof s.subtask === 'string' && typeof s.specialist === 'string')
          }
        } catch {
          // fall through to default
        }
      }

      const lines = raw.split('\n').filter(l => /^\s*[-\d*•]/.test(l)).slice(0, MAX_PARALLEL_AGENTS)
      if (lines.length > 1) {
        return lines.map((line, i) => ({
          subtask: line.replace(/^\s*[-\d.*•]+\s*/, ''),
          specialist: i === 0 ? 'arch' : i === lines.length - 1 ? 'testgen' : 'base',
          focus: `part ${i + 1} of ${lines.length}`,
        }))
      }

      return [{ subtask: fallbackPrompt, specialist: 'base', focus: 'full implementation' }]
    }

    const COT_SYSTEM_PREFIX = `You are a specialist agent in MetaBuff's parallel execution pipeline.
You are responsible for ONE specific subtask of a larger system.

PROTOCOL:
  1. Read every file relevant to your subtask before touching anything
  2. Verify all symbols, imports, and types you plan to use via code_search
  3. Make your changes with surgical str_replace operations
  4. Leave a brief comment in each changed file: // [MetaBuff Mega: <focus>]
  5. Do NOT attempt to handle subtasks assigned to other specialist agents
  6. Call end_turn only when your subtask is complete and verified

`

    // ── Phase 0: Understand the full codebase scope ──────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/file-picker@0.0.1',
          prompt:
            `Map the entire codebase structure relevant to this task.\n` +
            `List key files, their roles, and how they interconnect.\n` +
            `Task: ${prompt}`,
        }],
      },
    }

    // ── Phase 1: Architect-level decomposition ────────────────────────────────
    const { toolResult: decompositionRaw } = yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/thinker@0.0.1',
          prompt:
            `You are decomposing a large coding task for parallel execution.\n\n` +

            `Task: ${prompt}\n\n` +

            `Output ONLY a JSON array (no markdown, no explanation) of 3–${MAX_PARALLEL_AGENTS} subtasks.\n` +
            `Each element must be: { "subtask": "...", "specialist": "arch|security|testgen|base|research", "focus": "one-line description" }\n\n` +

            `Specialist guide:\n` +
            `  arch     → system design, component structure, data models, API contracts\n` +
            `  security → auth flows, input validation, secrets, access control, SQL injection\n` +
            `  testgen  → unit tests, integration tests, mocks for changed code\n` +
            `  base     → general implementation: business logic, UI, utilities\n` +
            `  research → documentation, README, changelog, ADRs\n\n` +

            `Rules:\n` +
            `  - Each subtask must be independently executable (no subtask depends on another)\n` +
            `  - Always include a testgen subtask\n` +
            `  - Always include an arch subtask if the task touches data models or APIs\n` +
            `  - Subtasks should not overlap — each file should appear in at most one subtask`,
        }],
      },
    }

    const subtasks = parseDecomposition(decompositionRaw, prompt)

    // ── Phase 2: Parallel specialist execution ────────────────────────────────
    // All specialists run simultaneously — this is the Antigravity 2.0 pattern
    const parallelAgents = subtasks.map(st => ({
      agent_type: resolveAgent(st.specialist),
      prompt: COT_SYSTEM_PREFIX +
        `SUBTASK [${st.focus}]:\n${st.subtask}\n\n` +
        `CONTEXT (full task for reference):\n${prompt}`,
    }))

    yield {
      toolName: 'spawn_agents',
      input: { agents: parallelAgents },
    }

    // ── Phase 3: Synthesis review ─────────────────────────────────────────────
    // Multiple agents just edited the codebase independently — check for
    // conflicts, inconsistencies, and integration issues
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'codebuff/reviewer@0.0.1',
          prompt:
            `Review the complete output of a parallel multi-agent session.\n\n` +
            `${subtasks.length} specialist agents just ran in parallel on:\n${prompt}\n\n` +
            `Check specifically for:\n` +
            `  1. Conflicting changes between agents (same file edited differently)\n` +
            `  2. Naming/interface inconsistencies across the codebase\n` +
            `  3. Missing integration glue between subsystems\n` +
            `  4. Any subtask that appears incomplete\n` +
            `Fix all issues found — do not just report them.`,
        }],
      },
    }

    // ── Phase 4: Type-check and test ───────────────────────────────────────────
    // Catches compile-time errors (regex, type mismatches) before the validator runs
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'basher',
          params: {
            command: 'echo "=== TYPE CHECK ===" && bun run typecheck 2>&1 | head -40 && echo "=== TESTS ===" && bun test 2>&1 | tail -30',
            what_to_summarize: 'Type-check and test results. Report any TypeScript errors or test failures. If errors found, describe them so the validator can fix them.',
          },
        }],
      },
    }

    // ── Phase 5: Final validation ─────────────────────────────────────────────
    yield {
      toolName: 'spawn_agents',
      input: {
        agents: [{
          agent_type: 'metabuff-validator',
          prompt: `Final validation pass for mega-task: ${prompt}`,
        }],
      },
    }
  },
}

export default definition

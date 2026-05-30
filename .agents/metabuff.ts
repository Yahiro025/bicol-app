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
 *   Task → [CoT enforcer + Complexity analyzer] → MetaBuff orchestrator
 *        → Simple:  planner → base → validator
 *        → Complex: file-picker → thinker → planner → base → reviewer → validator
 *        → Mega:    metabuff-mega (Antigravity-style parallel spawning)
 */

import { AgentDefinition } from './types/agent-definition'

// ─── Constants ───────────────────────────────────────────────────────────────

/** Free tier model.  Swap to 'deepseek/deepseek-v4-pro' if you have credits. */
const FREE_MODEL = 'deepseek/deepseek-v4-flash'

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Scores a prompt to classify task complexity.
 *
 * 0–2 → simple   (single-concern, 1-2 files)
 * 3–6 → complex  (multi-file, multiple concerns)
 * 7+  → mega     (system-wide, architectural, needs parallel agents)
 */
function analyzeComplexity(prompt: string): 'simple' | 'complex' | 'mega' {
  const p = prompt.toLowerCase()
  let score = 0

  // Mega signals
  const megaKw = [
    'from scratch', 'entire codebase', 'full system', 'operating system',
    'complete rewrite', 'new architecture', 'all files', 'every file',
    'redesign everything', 'migrate entire',
  ]
  megaKw.forEach(kw => { if (p.includes(kw)) score += 4 })

  // Complex signals
  const complexKw = [
    'multiple files', 'refactor', 'architecture', 'redesign', 'across the',
    'everywhere', 'integrate', 'migrate', 'all endpoints', 'all components',
    'add authentication', 'add auth', 'database migration', 'performance',
  ]
  complexKw.forEach(kw => { if (p.includes(kw)) score += 2 })

  // Length heuristic
  if (prompt.length > 500) score += 3
  else if (prompt.length > 200) score += 1

  // Explicit multi-file mention
  const fileMatches = prompt.match(/\b\w+\.(ts|tsx|js|jsx|py|go|rs|java|cpp|cs)\b/g)
  if (fileMatches && fileMatches.length > 5) score += 3
  else if (fileMatches && fileMatches.length > 2) score += 1

  if (score >= 7) return 'mega'
  if (score >= 3) return 'complex'
  return 'simple'
}

/**
 * Wraps any prompt with a mandatory Chain-of-Thought prefix.
 *
 * This is the single biggest lever for reducing DeepSeek Flash hallucinations:
 * forcing the model to verify file contents before editing and to narrate
 * reasoning at each step.
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
  • Run code_search for any symbol, function, or type you plan to reference
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
  • Run any available tests or lint commands via run_terminal_command
  • If anything looks wrong, fix it before calling end_turn

GROUNDING RULES (never violate):
  ✗ Do not reference a file path without having read it this session
  ✗ Do not assume a function or type exists — verify with code_search
  ✗ Do not invent package names or import paths
  ✗ Do not leave TODOs or placeholder code in the final output
  ✗ Do not call end_turn if there are unresolved ⚠ UNCERTAIN items
</metabuff_cot_protocol>

<task role="${role}">
${task}
</task>`
}

// ─── Agent Definition ─────────────────────────────────────────────────────────

const definition: AgentDefinition = {
  id: 'metabuff',
  version: '1.0.0',
  displayName: 'MetaBuff Orchestrator',

  spawnerPrompt:
    'Spawn MetaBuff as your primary agent for ANY coding task. ' +
    'It automatically classifies complexity and coordinates the optimal agent pipeline, ' +
    'including CoT enforcement and anti-hallucination validation.',

  model: FREE_MODEL,

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
    const complexity = analyzeComplexity(prompt)

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

      // Validate before finishing
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

      // 4. Code review
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

      // 5. Anti-hallucination validation pass
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
    }
  },
}

export default definition

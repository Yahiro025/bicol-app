# MetaBuff Agent System

This directory contains the **MetaBuff agent orchestration system** — a set of AI coding agents that work together to decompose, implement, validate, and test complex coding tasks.

## Architecture Overview

```
                     ┌─────────────┐
                     │   metabuff   │  ← Main orchestrator (complexity router)
                     └──────┬──────┘
                            │
              ┌─────────────┼─────────────┐
              │             │             │
         Simple         Complex        Mega
       (1-2 files)   (multi-file)   (parallel)
              │             │             │
              │        ┌────┴────┐        │
              │        │         │        │
         codebuff/base  │    metabuff─────┘
                    ┌───┴───┐     mega
                    │       │
              specialist    │
              agents   validator
```

### Agent Roles

| Agent | Role | Description |
|-------|------|-------------|
| `metabuff` | **Orchestrator** | Classifies task complexity (simple/complex/mega) and routes to the appropriate pipeline. Enforces Chain-of-Thought protocols. |
| `metabuff-mega` | **Parallel Spawner** | Decomposes large tasks into parallel subtasks and spawns specialist agents simultaneously (Antigravity 2.0 pattern). |
| `metabuff-validator` | **Validator** | Post-execution audit: catches ghost imports, phantom edits, broken tests, and incomplete implementations. |
| `metabuff-testgen` | **Test Generator** | Writes unit/integration tests matching the project's existing style. |
| `metabuff-arch` | **Architecture Analyst** | Handles data model design, API contracts, component structure, and dependency analysis. |
| `metabuff-security` | **Security Analyst** | Audits for hardcoded secrets, injection vulnerabilities, auth gaps, and insecure patterns. |

## Agent Definition Structure

Every agent file exports a default `AgentDefinition` object with this shape:

```typescript
import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  // Identity
  id: 'my-agent',
  version: '1.0.0',
  displayName: 'My Agent',

  // Prompts shown to users/other agents
  spawnerPrompt: 'Short description for spawning this agent.',
  systemPrompt: 'System prompt that sets the agent\'s personality and rules.',

  // Model config
  model: 'deepseek/deepseek-v4-flash',
  reasoningOptions: { enabled: true, exclude: false, effort: 'medium' },

  // Allowed tools
  toolNames: ['read_files', 'str_replace', 'write_file', 'spawn_agents', 'end_turn'],
  spawnableAgents: ['codebuff/base@0.0.1'],

  // Optional: programmatic orchestration
  handleSteps: function* ({ prompt }) {
    // Generator-based execution flow
  },
}

export default definition
```

### `AgentDefinition` Interface (from `types/agent-definition.ts`)

- `id` — Unique identifier for the agent
- `version` — SemVer version
- `displayName` — Human-readable name
- `spawnerPrompt` — Shown in agent list for spawning
- `model` — LLM model string
- `reasoningOptions` — Optional reasoning mode config (enabled, exclude, effort)
- `toolNames` — Tools the agent can invoke
- `spawnableAgents` — Other agents this agent can spawn
- `systemPrompt` — System prompt setting personality and rules
- `instructionsPrompt` — Optional detailed step-by-step instructions
- `includeMessageHistory` — Whether the agent sees full conversation history
- `stepPrompt` — Optional reminder prompt for multi-step flows
- `handleSteps` — Optional generator function for programmatic orchestration

## ⚠️ CRITICAL RULE: Inline Helpers Inside `handleSteps`

**Never reference module-level functions or constants inside `handleSteps`.**

### The Problem

The agent execution framework extracts the exported `definition` object from each file. **Module-level function and constant bindings are NOT preserved** in the execution context. If `handleSteps` references a function defined outside the object, you get:

```
Error: analyzeComplexity is not defined
```

### The Fix

Inline ALL helper functions and constants **inside** the `handleSteps` generator:

```typescript
// ❌ WRONG — module-level function, lost at runtime
function helper() { return 'value' }

const definition: AgentDefinition = {
  handleSteps: function* ({ prompt }) {
    const result = helper() // Runtime error: helper is not defined
  },
}

// ✅ CORRECT — inlined inside handleSteps
const definition: AgentDefinition = {
  handleSteps: function* ({ prompt }) {
    function helper() { return 'value' } // Safe: inside the closure
    const result = helper()
  },
}
```

### Safe Patterns

These are safe at module level because they're evaluated when the definition object is **created** (at import time):

```typescript
// ✅ SAFE — used in definition object PROPERTIES, not inside handleSteps
const FREE_MODEL = 'deepseek/deepseek-v4-flash'

const definition: AgentDefinition = {
  model: FREE_MODEL,                    // Evaluated at import time
  systemPrompt: `Using ${FREE_MODEL}`,  // Template evaluated at import time
}
```

### Files that follow this rule

| File | Has `handleSteps` | Status |
|------|:---:|:---:|
| `metabuff.ts` | ✅ | ✅ Fixed — helpers inlined |
| `metabuff-mega.ts` | ✅ | ✅ Fixed — helpers inlined |
| `metabuff-validator.ts` | ✅ | ✅ Safe — uses only locals/string literals |
| `metabuff-testgen.ts` | ❌ | ✅ N/A — no `handleSteps` |
| `metabuff-arch.ts` | ❌ | ✅ N/A — no `handleSteps` |
| `metabuff-security.ts` | ❌ | ✅ N/A — no `handleSteps` |

## Anti-Hallucination Protocol

All MetaBuff agents are wrapped with a Chain-of-Thought protocol that enforces five steps:

1. **ORIENT** — State the goal and list all files to read
2. **GROUND** — Read files and verify all symbols exist before referencing them
3. **PLAN** — Write a numbered action plan; flag uncertainties with `⚠ UNCERTAIN`
4. **EXECUTE** — Make targeted edits; narrate each change
5. **VERIFY** — Re-read changed files, run tests, fix issues

### Grounding Rules (Never Violate)

- ✗ Do not reference a file path without having read it
- ✗ Do not assume a function/type exists — verify with `code_search`
- ✗ Do not invent package names or import paths
- ✗ Do not leave TODOs or placeholder code
- ✗ Do not proceed with unresolved `⚠ UNCERTAIN` items

## Creating a New Agent

1. Create a new `.ts` file in this directory
2. Import `AgentDefinition` from `./types/agent-definition`
3. Define and export the `definition` object
4. If using `handleSteps`, inline ALL helper functions inside it
5. Add the new agent to `spawnableAgents` in `metabuff.ts` or `metabuff-mega.ts`
6. Add it to the table above in this README

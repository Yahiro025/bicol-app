# MetaBuff Known Issues & Lessons Learned

This file persists across sessions to provide inter-session memory.
Auto-populated by MetaBuff pipelines. Do not manually edit unless reviewing accuracy.

## Format
- `[DATE] CATEGORY: Issue description → Resolution/Fix`
- Categories: `HALLUCINATION | TYPE_ERROR | TEST_FAILURE | RUNTIME_ERROR | DESIGN_ISSUE | PERFORMANCE`

## Entries
<!-- New entries are appended below this line. Max 50 entries; oldest entries are pruned first. -->

- `[2026-05-30] HALLUCINATION: Module-level functions in handleSteps are not preserved at runtime because the agent execution framework extracts only the exported definition object. Inlining all helpers inside handleSteps fixed this.`
- `[2026-05-30] DESIGN_ISSUE: Complexity analysis had no upper bound — mentioning "refactor" 5 times scored 10+, causing false mega classification. Added COMPLEXITY_SATURATION = 8 and diminishing returns on keyword scoring.`
- `[2026-05-30] DESIGN_ISSUE: Parallel agent execution could produce conflicting edits in the same file. Added post-mega continuous validation checkpoint to detect and fix merge conflicts.`
- `[2026-05-30] DESIGN_ISSUE: No inter-session memory — each session started fresh, repeating past mistakes. Added known-issues.md with CoT prompt instructions for all agents to read it before starting work.`
- `[2026-05-30] RUNTIME_ERROR: Basher commands had no timeout — long-running commands could hang indefinitely. Added BASHER_TIMEOUT = 60s and explicit timeout_seconds on all basher spawns.`
- `[2026-05-30] TYPE_ERROR: Prisma client types (@prisma/client) fail to generate when schema has migration issues. Pre-existing project issue — run `npx prisma generate` to regenerate types after schema changes.`
- `[2026-05-30] PERFORMANCE: Full typecheck on every pipeline run (60+ files) was slow for simple 1-2 file changes. Simple pipeline typechecks only edited files via head -40.`
- `[2026-05-30] HALLUCINATION: Agents would write new files but never verify they compile. Added sandbox compile check (git diff --diff-filter=A) after generation tasks.`
- `[2026-05-30] DESIGN_ISSUE: Debugging pipeline failures was hard without intermediate checkpoints. Added continuous validation checkpoints after each major pipeline phase.`

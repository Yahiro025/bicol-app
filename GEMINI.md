
---
### 🌐 GLOBAL SKILL UTILIZATION DIRECTIVE
Whenever you, or any invoked subagent (\`/command\`), are generating code, designing UI, or making architectural decisions, you MUST:
1. **Check Installed Skills First**: Before using generic knowledge, query your available Gemini CLI skills/extensions (e.g., impeccable, kowalski, vercel-labs). 
2. **Prioritize Skill Rulesets**: If an installed skill (like Impeccable's \`DESIGN.md\` or Vercel's React Best Practices) provides a rule or pattern for the current task, you MUST follow it over generic AI suggestions.
3. **Explicit Invocation**: If a task falls under a skill's domain (e.g., UI design -> Impeccable/Kowalski, Backend -> Vercel), explicitly state that you are referencing that skill's rules before outputting the code.
4. **Conflict Resolution**: If multiple skills contradict each other, defer to Impeccable (\`DESIGN.md\`) for visual/design decisions, and Vercel for Next.js architectural decisions.

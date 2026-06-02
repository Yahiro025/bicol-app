/**
 * ECC Agent Converter — Batch #2 (Remaining Agents)
 *
 * Converts ECC markdown agents (YAML frontmatter + markdown body) into
 * Codebuff-compatible TypeScript AgentDefinition files.
 *
 * Skips the 15 agents already created.
 *
 * Usage: bun run scripts/ts/convert-ecc-agents-v2.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const ECC_AGENTS_DIR = '/tmp/ecc-clone/agents'
const OUTPUT_DIR = '.agents'

// Agents already created manually in batch 1
const ALREADY_CREATED = new Set([
  'architect', 'build-error-resolver', 'code-reviewer', 'database-reviewer',
  'docs-lookup', 'doc-updater', 'e2e-runner', 'harness-optimizer',
  'loop-operator', 'planner', 'python-reviewer', 'refactor-cleaner',
  'security-reviewer', 'tdd-guide', 'typescript-reviewer',
])

// ─── Tool name mapping ────────────────────────────────────────────────────
const TOOL_MAP: Record<string, string> = {
  Read: 'read_files', Write: 'write_file', Edit: 'str_replace',
  Bash: 'basher', Grep: 'code_searcher', Glob: 'glob',
}

function mapTools(eccTools: string[]): string[] {
  const mapped = eccTools.map((t) => TOOL_MAP[t] || t.toLowerCase())
  if (!mapped.includes('spawn_agents')) mapped.push('spawn_agents')
  return [...new Set(mapped)]
}

// ─── Model mapping ────────────────────────────────────────────────────────
const MODEL_MAP: Record<string, string> = {
  opus: 'deepseek/deepseek-v4-pro',
  sonnet: 'deepseek/deepseek-v4-flash',
  haiku: 'deepseek/deepseek-v4-flash',
}

function mapModel(eccModel: string): string {
  return MODEL_MAP[eccModel] || 'deepseek/deepseek-v4-flash'
}

function toTitleCase(name: string): string {
  return name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

// ─── YAML frontmatter parser ──────────────────────────────────────────────
interface ECCFrontmatter { name: string; description: string; tools: string[]; model: string }

function parseFrontmatter(content: string): { frontmatter: ECCFrontmatter; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) throw new Error('No YAML frontmatter found')
  const yamlBlock = match[1]!, body = match[2]!.trim()
  const fm: ECCFrontmatter = { name: '', description: '', tools: [], model: '' }
  for (const line of yamlBlock.split('\n')) {
    const kvMatch = line.match(/^(\w+):\s*(.*)$/)
    if (!kvMatch) continue
    const key = kvMatch[1]!, value = kvMatch[2]!.trim()
    if (key === 'name') fm.name = value
    else if (key === 'description') fm.description = value
    else if (key === 'model') fm.model = value
    else if (key === 'tools') {
      const arrMatch = value.match(/\[(.*)\]/)
      if (arrMatch) fm.tools = arrMatch[1]!.split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean)
    }
  }
  return { frontmatter: fm, body }
}

// ─── Extract systemPrompt from body ───────────────────────────────────────
function extractSystemPrompt(body: string): string {
  const lines = body.split('\n'), paragraph: string[] = []
  for (const line of lines) {
    const t = line.trim()
    if (!t || t.startsWith('#') || t.startsWith('---')) { if (paragraph.length > 0) break; continue }
    if (t.startsWith('## Prompt Defense')) { if (paragraph.length > 0) break; continue }
    paragraph.push(t)
    const text = paragraph.join(' ')
    if ((text.match(/[.!?]\s/g) || []).length >= 3) break
  }
  return paragraph.join(' ').trim() || 'A specialized ECC agent.'
}

// ─── Generate AgentDefinition file ────────────────────────────────────────
function generateAgentFile(fm: ECCFrontmatter, body: string): string {
  const id = `ecc-${fm.name}`
  const displayName = `ECC ${toTitleCase(fm.name)}`
  const model = mapModel(fm.model)
  const tools = mapTools(fm.tools)
  const systemPrompt = extractSystemPrompt(body)
  const escapedBody = body.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
  const toolNamesStr = tools.map(t => `'${t}'`).join(', ')

  return `/**
 * ECC ${toTitleCase(fm.name)} — Integrated into MetaBuff Ecosystem
 *
 * Source: ECC (affaan-m/ECC) agents/${fm.name}.md
 */

import { AgentDefinition } from './types/agent-definition'

const definition: AgentDefinition = {
  id: '${id}',
  version: '1.0.0',
  displayName: '${displayName}',
  spawnerPrompt: ${JSON.stringify(fm.description)},
  model: '${model}',
  reasoningOptions: { enabled: true, exclude: false, effort: 'medium' },
  toolNames: [${toolNamesStr}],
  spawnableAgents: [],
  systemPrompt: ${JSON.stringify(systemPrompt)},
  instructionsPrompt: \`${escapedBody}\`,
}

export default definition
`
}

// ─── Main ─────────────────────────────────────────────────────────────────
function main() {
  const agentFiles = fs.readdirSync(ECC_AGENTS_DIR).filter(f => f.endsWith('.md'))
  const remaining = agentFiles.filter(f => {
    const name = f.replace('.md', '')
    return !ALREADY_CREATED.has(name)
  })

  console.log(`Found ${agentFiles.length} total ECC agents, ${remaining.length} remaining to convert...\n`)

  let success = 0, failed = 0

  for (const file of remaining) {
    try {
      const content = fs.readFileSync(path.join(ECC_AGENTS_DIR, file), 'utf-8')
      const { frontmatter, body } = parseFrontmatter(content)
      const tsContent = generateAgentFile(frontmatter, body)
      const outFile = `ecc-${frontmatter.name}.ts`
      fs.writeFileSync(path.join(OUTPUT_DIR, outFile), tsContent)
      console.log(`  ✓ ${file} → ${outFile}`)
      success++
    } catch (err) {
      console.error(`  ✗ ${file}: ${err instanceof Error ? err.message : String(err)}`)
      failed++
    }
  }

  console.log(`\nDone: ${success} converted, ${failed} failed`)
}

main()

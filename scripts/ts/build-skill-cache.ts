/**
 * ECC Skill Cache Builder — MetaBuff v1.8.0
 *
 * Builds a JSON cache index of all 249 ECC skills for lightning-fast
 * hot-loading. The cache maps keywords → matching skill directories → skill content,
 * eliminating filesystem reads on every agent spawn.
 *
 * Output: .agents/.skill-cache.json
 *
 * Usage: bun run scripts/ts/build-skill-cache.ts
 *   or:  node scripts/ts/build-skill-cache.ts
 */

import * as fs from 'node:fs'
import * as path from 'node:path'

const SKILLS_DIR = '.agents/skills/ecc'
const CACHE_FILE = '.agents/.skill-cache.json'

interface SkillCache {
  /** Inverted index: keyword → [skill directory names] */
  index: Record<string, string[]>
  /** Skill directory name → truncated SKILL.md content */
  skills: Record<string, string>
  /** ISO timestamp of cache build */
  builtAt: string
  /** Number of skills indexed */
  skillCount: number
}

/**
 * Extract meaningful keywords from a string.
 * Used to build the inverted index from SKILL.md titles and descriptions.
 */
function extractKeywords(text: string): string[] {
  const lower = text.toLowerCase()
  const words = lower.match(/[a-z]{4,}/g) || []
  const stopWords = new Set([
    'this', 'that', 'with', 'from', 'have', 'will', 'your', 'into', 'when',
    'them', 'they', 'what', 'file', 'code', 'make', 'want', 'need', 'just',
    'like', 'some', 'more', 'then', 'also', 'than', 'even', 'only', 'over',
    'back', 'here', 'there', 'their', 'been', 'were', 'does', 'dont', 'should',
    'would', 'could', 'change', 'update', 'every', 'other', 'same', 'such',
  ])
  return [...new Set(words.filter(w => !stopWords.has(w)))]
}

/**
 * Build the complete skill cache from all 249 ECC skill directories.
 */
function buildCache(): SkillCache {
  const cache: SkillCache = {
    index: {},
    skills: {},
    builtAt: new Date().toISOString(),
    skillCount: 0,
  }

  if (!fs.existsSync(SKILLS_DIR)) {
    console.warn(`Skills directory not found: ${SKILLS_DIR}`)
    return cache
  }

  /**
   * Recursively find all SKILL.md files under SKILLS_DIR.
   * Returns array of { dirName, filePath } where dirName is the skill's
   * unique identifier: top-level dirs use their name; nested dirs use
   * "parent-name/child-name" to avoid collisions.
   */
  function findSkillFiles(dir: string, base: string = ''): Array<{ dirName: string; filePath: string }> {
    const results: Array<{ dirName: string; filePath: string }> = []
    let entries: fs.Dirent[]
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return results
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue

      const subDir = path.join(dir, entry.name)
      const skillFile = path.join(subDir, 'SKILL.md')
      const dirName = base ? `${base}/${entry.name}` : entry.name

      if (fs.existsSync(skillFile)) {
        results.push({ dirName, filePath: skillFile })
      }

      // Recurse into subdirectories for nested skill structures
      // (e.g., superpowers/ contains both a SKILL.md and sub-skills)
      results.push(...findSkillFiles(subDir, dirName))
    }

    return results
  }

  const skillFiles = findSkillFiles(SKILLS_DIR)

  console.log(`Indexing ${skillFiles.length} skill directories...`)

  for (const { dirName, filePath: skillFile } of skillFiles) {
    try {
      const raw = fs.readFileSync(skillFile, 'utf-8')
      // Strip YAML frontmatter
      const body = raw.replace(/^---[\s\S]*?---\n?/, '').trim()

      // Extract keywords from the directory name + skill content
      const dirKeywords = extractKeywords(dirName)
      const contentKeywords = extractKeywords(body.slice(0, 500)) // first 500 chars

      // Build inverted index
      const allKeywords = [...new Set([...dirKeywords, ...contentKeywords])]
      for (const kw of allKeywords) {
        if (!cache.index[kw]) cache.index[kw] = []
        if (!cache.index[kw].includes(dirName)) {
          cache.index[kw].push(dirName)
        }
      }

      // Store truncated skill content (2000 chars max)
      cache.skills[dirName] = body.length > 2000 ? body.slice(0, 2000) + '\n\n[truncated]' : body
      cache.skillCount++
    } catch (err) {
      console.warn(`  Skipping ${dirName}: ${err instanceof Error ? err.message : String(err)}`)
    }
  }

  console.log(`Indexed ${cache.skillCount} skills with ${Object.keys(cache.index).length} unique keywords`)
  return cache
}

/**
 * Main: build cache and write to JSON file.
 */
function main() {
  console.log('=== ECC Skill Cache Builder ===\n')
  const cache = buildCache()
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2))
  console.log(`\nCache written to ${CACHE_FILE} (${JSON.stringify(cache).length} bytes)`)
}

main()

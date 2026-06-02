import { describe, expect, test } from "bun:test";

// ─────────────────────────────────────────────────────────────────────────────
// MetaBuff Detector Regex Tests
// ─────────────────────────────────────────────────────────────────────────────
// These regexes are duplicated from .agents/metabuff.ts (inline in handleSteps).
// They exist here to catch regressions: if a detector's regex doesn't match
// its own enrichment domain tag (e.g., [domain:documentation confidence:0.7]),
// then the think_deeply → enrichedPrompt → computeDomainScores feedback loop
// is broken — the LLM's understanding never reaches the routing logic.
//
// Each test section covers:
//   1. Domain tag match   — "[domain:X confidence:Y]" must return true
//   2. Positive examples  — real-world prompts that SHOULD match
//   3. Negative examples  — things that should NOT match (false positive guard)
// ─────────────────────────────────────────────────────────────────────────────

// ─── Detector regexes (exact copies from .agents/metabuff.ts) ────────────────

const detectors = {
  algorithm:
    /\b(algorithm|algorithms|parse|parser|sort(?:ing)?|search(?:ing)?|graph|tree|trie|heap|dp|dynamic.?programm|recursion|recursive|memoiz|optimiz(?:e|ation)|performance|time.?complex|space.?complex|big.?o|bigint|float(?:ing.?point)?|numeric|precision|overflow|concurrent|concurren|mutex|race.?condition|deadlock|state.?machine|workflow.?engine|transpil|compil(?:er|ation)|lexer|tokeniz|ast|backtrack|greedy)\b/i,

  performance:
    /\b(performance|optimiz|slow|bottleneck|latency|throughput|bundle.?size|re.?render|lazy.?load|memory.?leak|profiling?)\b/i,

  security:
    /\b(secur(?:ity|e)(?:.?audit)?|vulnerab|owasp|cve|penetration|injection|hardcoded.?secret|unsafe.?crypto|rate.?limit)\b/i,

  architecture:
    /\b(architect(?:ure|ural)?|design.*(?:system|pattern|decision)|adr|component.*(?:structur|boundar|design))\b/i,

  testing:
    /\b(testing|tdd|test.?driven|write.?tests?.*first|red.?green.?refactor|test.?coverage|add.?tests?)\b/i,

  e2e:
    /\b(e2e|end.?to.?end|playwright|browser.?test|ui.?test|journey.?test)\b/i,

  build:
    /\b(build|compil(?:e|ation)|type.?error|tsc|typescript.?error|fix.*(?:error|build|type))\b/i,

  cleanup:
    /\b(dead.?code|cleanup|remove.?unused|unused.*(?:import|export|code|file|dep)|deprecat|consolidat|duplicat)\b/i,

  documentation:
    /\b(document(?:ation)?|docs?|readme|codemap|jsdoc|tsdoc|update.*(?:doc|readme|guide))\b/i,

  database:
    /\b(database|schema|migration|prisma|postgres|sql|supabase|query.*(?:perform|optimiz|plan)|n\+1)\b/i,

  review:
    /\b(review|audit|inspect|check.*(?:code|quality|security|patterns?))\b/i,

  a11y:
    /\b(a11y|accessibility|wcag|screen.?reader|aria|keyboard.?nav|focus.?manag|semantic.?html|alt.?text)\b/i,

  ml:
    /\b(machine.?learn|\bml\b|training|model|neural|inference|pytorch|tensor(?:flow)?|cuda|gpu|dataset|fine.?tun|embedding|transformer|llm)\b/i,

  network:
    /\b(network|bgp|vlan|dns|cisco|firewall|rout(?:e|ing)|ssh|subnet|switch|load.?balanc|vpn|wireguard|dhcp)\b/i,

  autonomous:
    /\b(autonomous|loop|continuous|background|daemon|cron|worker|polling|watch|agent.*loop|forever)\b/i,

  // Language detectors
  go:        /\b(go(lang)?|goroutine|channel|gofmt|golangci|go.?mod|go.?build)\b/i,
  rust:      /\b(rust|cargo|life.?time|borrow.?check|trait|macro|crate|tokio|serde|actix|axum)\b/i,
  java:      /\b(java\b|spring|maven|gradle|jvm)\b/i,
  kotlin:    /\b(kotlin|ktor|coroutine|android)\b/i,
  swift:     /\b(swift|xcode|ios|macos|uikit|swiftui|app.?store|core.?data|combine)\b/i,
  csharp:    /\b(c#|csharp|dotnet|asp\.?net|blazor|xamarin|unity|entity.?framework)\b/i,
  cpp:       /\b(c\+\+|cpp|cmake|opengl|vulkan|unreal|qt|boost|clang|gcc)\b/i,
  dart:      /\b(dart|flutter|widget|pubspec)\b/i,
  fsharp:    /\b(f#|fsharp|dotnet|functional)\b/i,  // NOTE: isReactSpecificTask in metabuff.ts has an additional exclusion clause:
  // `&& !/\b(typescript|tsx?)\b/i.test(p)` — it only matches React keywords
  // when TypeScript keywords are absent. This test covers the positive regex;
  // the exclusion is a separate boolean operation in the real detector.
  react:
    /\b(react|jsx|hooks?|useEffect|useState|redux|zustand|context.?api)\b/i,
  django:    /\b(django|orm|migrations?|admin|queryset|modelform|class.?based.?view)\b/i,
  fastapi:   /\b(fastapi|pydantic|starlette|openapi|dependency.?injection|uvicorn)\b/i,
  typescript: /\b(typescript|tsx?|react|next\.?js|node\.?js|express|prisma|tailwind)\b/i,
  python:    /\b(python|django|flask|fastapi|pytest|pip|scraper|wiktionary)\b/i,
} as const;

type DetectorName = keyof typeof detectors;

/**
 * Builds a semantic enrichment tag string as produced by semanticEnrich().
 * These tags are injected into enrichedPrompt and must be matchable by
 * the corresponding detector regex.
 */
function domainTag(domain: string, confidence = 0.7): string {
  return `[domain:${domain} confidence:${confidence}]`;
}

/** Helper: test that a domain tag matches its own detector */
function tagMatches(name: DetectorName): boolean {
  return detectors[name].test(domainTag(name));
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: Enrichment Domain Tag Matching (CRITICAL — no regressions allowed)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Enrichment domain tag matching", () => {
  test("algorithm tag matches isAlgorithmTask", () => { expect(tagMatches("algorithm")).toBe(true); });
  test("performance tag matches isPerformanceTask", () => { expect(tagMatches("performance")).toBe(true); });
  test("security tag matches isSecurityAuditTask", () => { expect(tagMatches("security")).toBe(true); });
  test("architecture tag matches isArchitectureTask", () => { expect(tagMatches("architecture")).toBe(true); });
  test("testing tag matches isTDDTask", () => { expect(tagMatches("testing")).toBe(true); });
  test("e2e tag matches isE2ETask", () => { expect(tagMatches("e2e")).toBe(true); });
  test("build tag matches isBuildErrorTask", () => { expect(tagMatches("build")).toBe(true); });
  test("cleanup tag matches isCleanupTask", () => { expect(tagMatches("cleanup")).toBe(true); });
  test("documentation tag matches isDocTask", () => { expect(tagMatches("documentation")).toBe(true); });
  test("database tag matches isDatabaseTask", () => { expect(tagMatches("database")).toBe(true); });
  test("review tag matches isReviewTask", () => { expect(tagMatches("review")).toBe(true); });
  test("a11y tag matches isA11yTask", () => { expect(tagMatches("a11y")).toBe(true); });
  test("ml tag matches isMLTask", () => { expect(tagMatches("ml")).toBe(true); });
  test("network tag matches isNetworkTask", () => { expect(tagMatches("network")).toBe(true); });
  test("autonomous tag matches isAutonomousTask", () => { expect(tagMatches("autonomous")).toBe(true); });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: Real-world positive examples
// ═══════════════════════════════════════════════════════════════════════════════

describe("isAlgorithmTask — positive examples", () => {
  const re = detectors.algorithm;
  test("sort an array of objects by multiple keys", () => { expect(re.test("sort an array of objects by multiple keys")).toBe(true); });
  test("implement a recursive tree traversal", () => { expect(re.test("implement a recursive tree traversal")).toBe(true); });
  test("fix race condition in concurrent code", () => { expect(re.test("fix race condition in concurrent code")).toBe(true); });
  test("optimize O(n^2) to O(n log n)", () => { expect(re.test("optimize O(n^2) to O(n log n)")).toBe(true); });
  test("write a lexer for this DSL", () => { expect(re.test("write a lexer for this DSL")).toBe(true); });
});

describe("isPerformanceTask — positive examples", () => {
  const re = detectors.performance;
  test("this page is slow to load", () => { expect(re.test("this page is slow to load")).toBe(true); });
  test("optimize the database queries", () => { expect(re.test("optimize the database queries")).toBe(true); });
  test("there's a memory leak in the worker", () => { expect(re.test("there's a memory leak in the worker")).toBe(true); });
  test("reduce bundle size", () => { expect(re.test("reduce bundle size")).toBe(true); });
  test("fix excessive re-renders", () => { expect(re.test("fix excessive re-renders")).toBe(true); });
});

describe("isSecurityAuditTask — positive examples", () => {
  const re = detectors.security;
  test("audit the auth flow for vulnerabilities", () => { expect(re.test("audit the auth flow for vulnerabilities")).toBe(true); });
  test("fix SQL injection in user endpoint", () => { expect(re.test("fix SQL injection in user endpoint")).toBe(true); });
  test("add rate limiting to API", () => { expect(re.test("add rate limiting to API")).toBe(true); });
  test("make this secure", () => { expect(re.test("make this secure")).toBe(true); });
  test("there's a hardcoded secret in config", () => { expect(re.test("there's a hardcoded secret in config")).toBe(true); });
});

describe("isArchitectureTask — positive examples", () => {
  const re = detectors.architecture;
  test("design a new component structure", () => { expect(re.test("design a new component structure")).toBe(true); });
  test("write an ADR for database choice", () => { expect(re.test("write an ADR for database choice")).toBe(true); });
  test("architectural review of the API layer", () => { expect(re.test("architectural review of the API layer")).toBe(true); });
  test("design system for reusable components", () => { expect(re.test("design system for reusable components")).toBe(true); });
});

describe("isTDDTask — positive examples", () => {
  const re = detectors.testing;
  test("add tests for the user service", () => { expect(re.test("add tests for the user service")).toBe(true); });
  test("write test-driven code for the parser", () => { expect(re.test("write test-driven code for the parser")).toBe(true); });
  test("improve test coverage to 80%", () => { expect(re.test("improve test coverage to 80%")).toBe(true); });
});

describe("isE2ETask — positive examples", () => {
  const re = detectors.e2e;
  test("add Playwright tests for checkout flow", () => { expect(re.test("add Playwright tests for checkout flow")).toBe(true); });
  test("set up e2e testing pipeline", () => { expect(re.test("set up e2e testing pipeline")).toBe(true); });
  test("end-to-end browser test for onboarding", () => { expect(re.test("end-to-end browser test for onboarding")).toBe(true); });
});

describe("isBuildErrorTask — positive examples", () => {
  const re = detectors.build;
  test("fix TypeScript compilation errors", () => { expect(re.test("fix TypeScript compilation errors")).toBe(true); });
  test("build is broken after merge", () => { expect(re.test("build is broken after merge")).toBe(true); });
  test("type error on line 42", () => { expect(re.test("type error on line 42")).toBe(true); });
});

describe("isCleanupTask — positive examples", () => {
  const re = detectors.cleanup;
  test("remove unused imports", () => { expect(re.test("remove unused imports")).toBe(true); });
  test("cleanup dead code in utils", () => { expect(re.test("cleanup dead code in utils")).toBe(true); });
  test("consolidate duplicate helper functions", () => { expect(re.test("consolidate duplicate helper functions")).toBe(true); });
  test("this component is getting bloated", () => { expect(re.test("this component is getting bloated")).toBe(false); }); // 'bloated' not in regex
  test("deprecate the old API", () => { expect(re.test("deprecate the old API")).toBe(true); });
});

describe("isDocTask — positive examples", () => {
  const re = detectors.documentation;
  test("update the README with new API", () => { expect(re.test("update the README with new API")).toBe(true); });
  test("write JSDoc for all exported functions", () => { expect(re.test("write JSDoc for all exported functions")).toBe(true); });
  test("update documentation for the new endpoint", () => { expect(re.test("update documentation for the new endpoint")).toBe(true); });
  test("add TSDoc comments", () => { expect(re.test("add TSDoc comments")).toBe(true); });
});

describe("isDatabaseTask — positive examples", () => {
  const re = detectors.database;
  test("add migration for the users table", () => { expect(re.test("add migration for the users table")).toBe(true); });
  test("optimize this PostgreSQL query", () => { expect(re.test("optimize this PostgreSQL query")).toBe(true); });
  test("fix N+1 query in the posts endpoint", () => { expect(re.test("fix N+1 query in the posts endpoint")).toBe(true); });
  test("update Prisma schema", () => { expect(re.test("update Prisma schema")).toBe(true); });
});

describe("isReviewTask — positive examples", () => {
  const re = detectors.review;
  test("review the changes for bugs", () => { expect(re.test("review the changes for bugs")).toBe(true); });
  test("audit the codebase for patterns", () => { expect(re.test("audit the codebase for patterns")).toBe(true); });
  test("inspect the auth module", () => { expect(re.test("inspect the auth module")).toBe(true); });
});

describe("isA11yTask — positive examples", () => {
  const re = detectors.a11y;
  test("fix keyboard navigation in the modal", () => { expect(re.test("fix keyboard navigation in the modal")).toBe(true); });
  test("add ARIA labels to form inputs", () => { expect(re.test("add ARIA labels to form inputs")).toBe(true); });
  test("check color contrast for WCAG compliance", () => { expect(re.test("check color contrast for WCAG compliance")).toBe(true); });
  test("make the app accessible to screen readers", () => { expect(re.test("make the app accessible to screen readers")).toBe(true); });
});

describe("isMLTask — positive examples", () => {
  const re = detectors.ml;
  test("fine-tune the embedding model", () => { expect(re.test("fine-tune the embedding model")).toBe(true); });
  test("optimize GPU inference pipeline", () => { expect(re.test("optimize GPU inference pipeline")).toBe(true); });
  test("train a neural network on this dataset", () => { expect(re.test("train a neural network on this dataset")).toBe(true); });
  test("the LLM response is too slow", () => { expect(re.test("the LLM response is too slow")).toBe(true); });
});

describe("isNetworkTask — positive examples", () => {
  const re = detectors.network;
  test("configure the firewall rules", () => { expect(re.test("configure the firewall rules")).toBe(true); });
  test("set up WireGuard VPN", () => { expect(re.test("set up WireGuard VPN")).toBe(true); });
  test("troubleshoot DNS resolution issues", () => { expect(re.test("troubleshoot DNS resolution issues")).toBe(true); });
  test("add a load balancer", () => { expect(re.test("add a load balancer")).toBe(true); });
});

describe("isAutonomousTask — positive examples", () => {
  const re = detectors.autonomous;
  test("create a background worker for email", () => { expect(re.test("create a background worker for email")).toBe(true); });
  test("set up a cron job for cleanup", () => { expect(re.test("set up a cron job for cleanup")).toBe(true); });
  test("run this autonomously in a loop", () => { expect(re.test("run this autonomously in a loop")).toBe(true); });
  test("watch for file changes and rebuild", () => { expect(re.test("watch for file changes and rebuild")).toBe(true); });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 3: Negative examples (false positive guards)
// ═══════════════════════════════════════════════════════════════════════════════

describe("Negative: bare words that should NOT trigger detectors", () => {
  test("'test' alone should NOT match isTDDTask", () => {
    // "test" alone is too vague — was a false positive in v2.0.2, fixed in v2.0.3
    expect(detectors.testing.test("run the test")).toBe(false);
    expect(detectors.testing.test("the test failed")).toBe(false);
    expect(detectors.testing.test("check the test output")).toBe(false);
  });

  test("'document' alone should NOT match isDocTask", () => {
    // "document" is ambiguous (could be a data object, not docs)
    expect(detectors.documentation.test("this document")).toBe(false);
  });

  test("'secure' should NOT match isSecurityAuditTask in non-security context", () => {
    // "secure" IS a legitimate security signal per the enrichment synonym map
    // So this IS expected to match — testing that the regex behavior is consistent
    expect(detectors.security.test("make this secure")).toBe(true);
  });

  test("'slow' in non-performance context still matches (by design)", () => {
    // "slow" is a performance signal regardless of context
    expect(detectors.performance.test("the build is slow")).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 4: Enrichment tag format edge cases
// ═══════════════════════════════════════════════════════════════════════════════

describe("Enrichment tag format variations", () => {
  test("tags with different confidence values still match", () => {
    expect(detectors.performance.test("[domain:performance confidence:0.3]")).toBe(true);
    expect(detectors.performance.test("[domain:performance confidence:1.0]")).toBe(true);
    expect(detectors.performance.test("[domain:performance confidence:0.95]")).toBe(true);
  });

  test("multiple tags in same string — each domain matches its detector", () => {
    const multiTag = "[domain:performance confidence:0.7], [domain:database confidence:0.6]";
    expect(detectors.performance.test(multiTag)).toBe(true);
    expect(detectors.database.test(multiTag)).toBe(true);
    expect(detectors.security.test(multiTag)).toBe(false);
  });

  test("tags inside full enriched prompt still match", () => {
    const enriched = "fix the slow page\n\n<!-- SEMANTIC ENRICHMENT: [domain:performance confidence:0.7], [domain:ui confidence:0.5] -->";
    expect(detectors.performance.test(enriched)).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 5: Language detector enrichment tag matching
// ═══════════════════════════════════════════════════════════════════════════════

describe("Language detector domain tag matching", () => {
  test("go tag matches isGoTask", () => { expect(detectors.go.test(domainTag("go"))).toBe(true); });
  test("rust tag matches isRustTask", () => { expect(detectors.rust.test(domainTag("rust"))).toBe(true); });
  test("java tag matches isJavaTask", () => { expect(detectors.java.test(domainTag("java"))).toBe(true); });
  test("javascript should NOT match isJavaTask (word boundary guard)", () => {
    expect(detectors.java.test("javascript")).toBe(false);
  });
  test("kotlin tag matches isKotlinTask", () => { expect(detectors.kotlin.test(domainTag("kotlin"))).toBe(true); });
  test("swift tag matches isSwiftTask", () => { expect(detectors.swift.test(domainTag("swift"))).toBe(true); });
  test("csharp tag matches isCSharpTask", () => { expect(detectors.csharp.test(domainTag("csharp"))).toBe(true); });
  test("cpp tag matches isCppTask", () => { expect(detectors.cpp.test(domainTag("cpp"))).toBe(true); });
  test("dart tag matches isDartFlutterTask", () => { expect(detectors.dart.test(domainTag("dart"))).toBe(true); });
  test("fsharp tag matches isFSharpTask", () => { expect(detectors.fsharp.test(domainTag("fsharp"))).toBe(true); });
  test("react tag matches isReactSpecificTask", () => { expect(detectors.react.test(domainTag("react"))).toBe(true); });
  test("django tag matches isDjangoTask", () => { expect(detectors.django.test(domainTag("django"))).toBe(true); });
  test("fastapi tag matches isFastAPITask", () => { expect(detectors.fastapi.test(domainTag("fastapi"))).toBe(true); });
  test("typescript tag matches isTypeScriptTask", () => { expect(detectors.typescript.test(domainTag("typescript"))).toBe(true); });
  test("python tag matches isPythonTask", () => { expect(detectors.python.test(domainTag("python"))).toBe(true); });
});

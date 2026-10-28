# Repository-wide Guidance

## Architecture and workflow
- Preserve dependency direction: Schema -> Core and Protocol -> Server. Client runtime may depend on Schema/Protocol, never Core/Server; SDK composes Client, Core and Server.
- After public Protocol or Server HttpApi changes, run `bun run generate` in `packages/client`; never edit generated client files directly. No Changesets: follow the existing release workflow.
- Use the repository's current default branch (currently `dev`) as the base for branches/worktrees and PRs, and diff against its remote-tracking branch unless told otherwise. Branch names are at most three hyphen-separated words, without prefixes. Use conventional commit/PR titles (`feat|fix|docs|chore|refactor|test(scope): summary`). User-facing `feat`, `fix`, `perf` PRs need an accessible looping SVG under `### Visual` (`currentColor`, 240x72, good static frame, CSS/SMIL only, <8 KB, no scripts/external references).
- Before editing another package, read and follow its nearest `AGENTS.md`; package-specific instructions belong in that scope.
- For a bare or underspecified request (for example, `test`) with no target or command, ask for scope before inspecting files or running checks.

## Code style
- Keep code simple and consistent. Validate unknown data once at its owning boundary; avoid redundant checks, speculative complexity without user approval, and premature single-use helpers. Keep the main path clear; extract helpers for reusable or genuinely complex work.
- Avoid `any` and `try/catch` where possible. Prefer Bun APIs, inferred types, `const`, early returns (avoid `else`), functional array methods, and comments for non-obvious constraints. Inline values used once; avoid unnecessary destructuring.
- In `src/config`, follow the self-export pattern. In Effect generators bind services before use; avoid nested yields. Keep synchronous parsing/building out of Effect helpers and prefer Effect schema helpers for untrusted JSON.
- Avoid import aliases, star imports, and type-position `import()` references. Prefer canonical exported namespaces and dynamic imports for heavy, branch-specific modules. Follow existing module patterns.
- Public contracts have one canonical owner; preserve package boundaries and avoid bridge/duplicate schemas. Use snake_case Drizzle fields with inferred column names.
- Before adding complexity for a speculative race/security edge case, explain concrete failure, likelihood, and cost and get user buy-in.

## Tests and checks
- Before adding a test, identify its observable contract, credible regression, and why existing tests miss it; otherwise do not add it. Each contract has one owner at the strongest boundary: extend the area's keeper/e2e or owning unit suite, not both. Test production behavior, avoid mocks and do not use `globalThis.*` unless unavoidable. Avoid testing dependencies, pass-through config, or source text unless source text is the contract.
- Do not add production seams for tests (test-only exports/parameters/flags/globals/data attributes). Drive real entry points; control time with `setSystemTime`. Tests must fail on the pre-fix behavior; do not mock the behavior under assertion, use soft assertions for guarded ordering, or leave `rejects`/`resolves` unawaited.
- Avoid duplicate cases across themes/directions/viewports/channels unless behavior differs. When moving coverage, name the remaining test, mutate the owner once, and confirm the new test fails. Do not duplicate session-ui component-test coverage in app e2e.
- Never run tests from repo root. Before changing tests, read the relevant `.opencode/skills` guide (`unit-tests`, `tui-tests`, `app-e2e-tests`, `component-tests`).
- Canonical check: `bun run check` at root. Focused check: `bun typecheck` in the package. Do not run `tsc` directly; `typecheck:tsc` is CI's compiler and authoritative on disagreement. For unexplained disagreement, create a minimal Bun issue repro; declaration-only diagnostics such as TS5088/TS2883 may occur only in tsc.

# Repository Provisioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Provision a reproducible, strictly typed DAA programming repository.

**Architecture:** Aftman pins tools, Wally pins libraries, and Sleitnick Loader starts one flat folder per runtime. A code-only Rojo project is reused by the local baseplate project. Each AI client uses its native configuration.

**Tech Stack:** Aftman, Wally, Rojo, Luau, luau-lsp, Lune, StyLua, PowerShell.

**Spec:** `docs/superpowers/specs/2026-11-08-repository-provisioning-design.md`

## Global Constraints

- Bootstrap and tooling only; Aftman + Wally; all ten requested packages.
- Exactly one production server Script and one client LocalScript; other code is modules.
- Strict first-party Luau with the owner's three-line author header, PascalCase, UPPER_SNAKE_CASE constants, and private `_camelCase` fields.
- No local world/test content in staging and no publishing, cloud upload, or remote push.
- Native Codex, Claude Code, Antigravity CLI support with both Studio MCPs and Context7.
- Keep vendor code unchanged except generated Wally exported-type repairs.

## Review Focus

- Rokit earlier on PATH: repository commands must select Aftman's pinned binaries.
- Existing staging world: code project must never own Workspace or unrelated service children.
- New startup modules: load all before starting, and do not auto-start helper descendants.
- Multiple Studio windows: enumerate and explicitly select the local instance for tests.
- Client-specific config drift: validate with current installed CLIs and official schemas/docs.

## Execution

Implement inline because the toolchain, sourcemap, and bootstrap share interfaces; use a fresh whole-repository reviewer at the end. Owner approved implementation; no additional plan approval checkpoint is needed. Track evidence and deviations in `.superpowers/sdd/repository-provisioning/progress.md`.

### Task 1: Pinned tools and safe Rojo projects

**Files:** `aftman.toml`, `wally.toml`, `wally.lock`, `default.project.json`, `local.project.json`, `.luaurc`, `.stylua.toml`, `.gitattributes`, `scripts/Environment.ps1`, `scripts/Setup.ps1`, `.vscode/settings.json`, `.vscode/extensions.json`, `places/Baseplate.rbxlx`.

**Interfaces:** Setup installs packages, repairs exported types, generates `sourcemap.json`, and builds the canonical local place. Environment prepends Aftman's bin to process PATH. Staging owns `ReplicatedStorage.DAA`, `ServerScriptService.DAA`, and `StarterPlayer.StarterPlayerScripts.DAA` only; ProfileStore is server-only.

- [ ] Install current stable tools through Aftman; verify actual executable versions.
- [ ] Install exact Wally dependencies and generate the lockfile.
- [ ] Add code-only project and local project reusing it with a baseplate and test mapping.
- [ ] Build both projects and inspect the resulting trees for world exclusion and server-only packages.
- [ ] Commit the toolchain and project foundation.

### Task 2: Typed single-script bootstrap and verification

**Files:** `src/Server/Bootstrap.server.luau`, `src/Client/Bootstrap.client.luau`, `src/Server/Services/init.meta.json`, `src/Client/Controllers/init.meta.json`, `src/Shared/init.meta.json`, `tests/Studio/Bootstrap.spec.luau`, `tests/VerifyPlace.luau`, `scripts/Check.ps1`, `scripts/Serve.ps1`.

**Interfaces:** Bootstrap calls `Loader.LoadChildren` on Services/Controllers and `Loader.SpawnAll(..., "OnStart")`. Startup modules expose `OnStart(self): ()`; no ordering dependencies. Tests are local-only modules. Check formats, analyzes, builds, and inspects output. Serve selects Local or Staging explicitly with distinct ports.

- [ ] Write the place check first: assert exactly two production entry points, no tests/world in staging, and identical production source in local/staging output; run and observe missing-bootstrap failure.
- [ ] Add minimal entry points using the installed Loader, plus local Studio lifecycle tests using temporary fixtures.
- [ ] Run formatting, strict analysis, build inspection, and Lune checks; document real engine limits.
- [ ] Commit the bootstrap and checks.

### Task 3: Native agents, MCPs, and documentation

**Files:** `AGENTS.md`, `CLAUDE.md`, `.codex/config.toml`, `.codex/agents/*.toml`, `.claude/agents/*.md`, `.mcp.json`, `.agents/agents/*.md`, `.agents/mcp_config.json`, `README.md`, `docs/README.md`, `docs/{setup,architecture,conventions,agents,lore}.md`, `scripts/TestMcp.mjs`.

**Interfaces:** Three roles (luau-implementer, luau-reviewer, luau-verifier) follow shared rules and return bounded evidence. Native configs register `Roblox_Studio`, `daa-studio` (Chrrxs), and Context7 with no credentials. Windows launchers use supported command forms.

- [ ] Create native configurations and concise role instructions; verify discovery/syntax with available CLIs.
- [ ] Install matching Rojo and Chrrxs Studio plugins; handshake MCP servers and enumerate instances.
- [ ] Build the document index and concise setup, architecture, conventions, workflow, and lore references.
- [ ] Run local Studio tests if available; record any UI toggle/restart limitations.
- [ ] Request fresh spec-compliance and quality review; resolve material findings, rerun checks, commit and integrate locally.

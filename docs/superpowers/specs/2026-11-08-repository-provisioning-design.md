# DAA repository provisioning

Status: proposed for approval. Date: 2026-11-08 (America/New_York).

## Intent

Create the programming foundation for Department of Anomalous Affairs (DAA),
whose setting is Blackridge Complex. This repository owns code and code tests.
The public [Blackridge archive](https://blackridge-archive.com/) is the lore
reference; it is not a specification for gameplay to implement during setup.
Only short contextual notes and source links belong in the repository.

## Agreed scope

- Bootstrap and tooling only; no gameplay systems.
- Aftman and Wally, as selected by the owner.
- Codex, Claude Code, and Antigravity CLI, with their native configuration formats.
- Both the built-in Roblox Studio MCP and Chrrxs Roblox Studio MCP.
- Strictly typed first-party Luau, Ponytail ultra, and the owner's naming,
  authorship, and comment conventions.
- A local baseplate for programming and testing. When an update is ready, the
  programmer opens the cloud staging place in Studio and connects Rojo to sync
  code. This does not upload or publish the local place.

World building, models, sound, VFX, persistence schemas, and gameplay mechanics
are outside this provisioning task. Temporary fixtures are allowed only in the
local test place. No local world content enters the staging project.

## Approaches

1. **Aftman + Wally, selected by the owner.** One pinned Aftman tool manifest and
   a Wally manifest/lockfile. Aftman is unmaintained upstream, but already
   installed here; verify it can install the selected current tools. Do not add
   a duplicate Rokit manifest. Resolve the existing Rokit-first PATH in the
   repository command environment so commands actually use Aftman's tools.
2. **Rokit + Wally, considered.** Maintained tool manager already installed on
   this machine, but not the owner's preference.
3. **Additional gameplay framework, considered and rejected.** Sleitnick Loader
   already meets the requested single-script architecture. A second service
   framework would duplicate loading, lifecycle, or dependency conventions.

## Repository and runtime

- `src/Server`: server bootstrap and service ModuleScripts.
- `src/Client`: client bootstrap and controller ModuleScripts.
- `src/Shared`: explicitly required utilities and shared types.
- `tests`: focused pure-Luau checks and Studio integration checks, outside staging.
- `places`: reproducible local test place, with local saved copies ignored.
- `scripts`: a small set of PowerShell commands for setup, checks, and serving.
- `docs/README.md`: repository-wide document index, linking setup, architecture,
  conventions, agent workflow, and the brief lore reference.

There is exactly one authored executable server Script and one authored client
LocalScript in the staging code tree. All other runtime first-party code is
ModuleScripts. Each entry point loads its own flat startup folder through
Sleitnick Loader, then starts the loaded modules. Shared utilities and nested
helpers are never recursively auto-started. Startup modules do not yield or
perform work at require time; asynchronous startup dependencies must be explicit.
Modules communicate through direct requires, Signal, and Net where appropriate.
No service locator, dependency container, or custom loader framework is added.

The builder may choose the smallest typed lifecycle compatible with Loader.
Document its exact contract and failure behavior, and add a meaningful startup
check. Bootstrap does not invent example services solely to fill folders.

## Rojo boundaries

`default.project.json` is the staging-safe, code-only project. It owns clearly
named DAA code/package folders in ReplicatedStorage, ServerScriptService, and
StarterPlayerScripts. Preserve unrelated instances at service boundaries while
allowing obsolete code inside owned DAA folders to be removed during sync.
It must contain no Workspace, Terrain, Lighting, SoundService, fixture, or test
mapping, and must not change global game properties.

A separate local project reuses that same code mapping and adds only a baseplate,
spawn, and test harness. Build and retain a local place under `places/`; keep a
canonical reproducible seed and ignore programmers' saved working copies. The
builder chooses the least duplicative supported Rojo representation and verifies
the two builds contain identical production script sources.

Serve staging code and the local test project with explicit commands and distinct
ports. Default routine sync uses the code-only mapping. Staging instructions
require selecting the intended Studio instance and reviewing the Rojo diff.
Do not add a whole-place upload command, credentials, or automatic publishing.

## Packages and tools

Pin the newest stable releases verified at implementation time. Current research
finds Rojo 7.7.1, Wally 0.3.2, Lune 0.11.1, luau-lsp 1.70.1, StyLua 2.6.0, and
wally-package-types 1.7.0. Include the matching Rojo Studio plugin setup.

Use JohnnyMorganz's luau-lsp for editor LSP and command-line analysis, including
Roblox definitions, a generated Rojo sourcemap, and package exported-type fixes.
Lune is for pure-Luau dry runs and place inspection; it is not a Roblox engine
emulator. Document commands agents can run without a built-in LSP interface.

Requested Wally dependencies, researched versions:

| Alias | Package | Version | Placement |
| --- | --- | --- | --- |
| Trove | sleitnick/trove | 1.8.0 | shared |
| Signal | sleitnick/signal | 2.0.3 | shared |
| Promise | evaera/promise | 4.0.0 | shared |
| Net | sleitnick/net | 0.2.0 | shared |
| Component | sleitnick/component | 2.4.8 | shared |
| Spring | sleitnick/spring | 1.0.0 | shared |
| Shake | sleitnick/shake | 1.1.0 | shared |
| EnumList | sleitnick/enum-list | 2.1.0 | shared |
| Loader | sleitnick/loader | 2.0.0 | shared |
| ProfileStore | lm-loleris/profilestore | 1.0.3 | server only |

ProfileStore's official repository is MadStudioRoblox/ProfileStore, authored by
loleris. Its upstream manifest specifies `lm-loleris/profilestore`; do not
substitute a third-party package using a similar name. Preserve vendor sources,
licenses, and authorship. Owner code conventions apply to first-party code only.
Installed packages need not be exercised or wrapped until a feature needs them.

## Agent support

`AGENTS.md` is the shared, concise instruction source for Codex and Antigravity.
`CLAUDE.md` imports it with Claude's supported syntax and adds only Claude-specific
notes. Both point to the document index instead of embedding all system docs.

Provide native implementation, review, and verification subagents:

- Codex: `.codex/agents/*.toml`, current standalone custom-agent schema.
- Claude: `.claude/agents/*.md`, native YAML frontmatter and capability controls.
- Antigravity CLI: `.agents/agents/*.md`, native YAML frontmatter, `subagent: true`.

Each agent reads shared instructions and its bounded assignment. Delegate narrow
tasks with file ownership, acceptance criteria, and necessary context instead of
the full parent transcript. One implementer owns a file set at a time. Review
specification compliance first, then code quality in fresh review contexts.
Reviewers report evidence and do not edit code; verifier reports actual commands,
results, and missing checks. The coordinator resolves findings and integrates.
Parallel work is limited to independent ownership; do not spawn for trivial work.
Apply available Superpowers workflows without assuming a developer's absolute
skill-install path exists on another machine. Document how to install the real
Superpowers plugin for each supported client; do not vendor partial copies.

Use native project MCP files, not a shared config copied into incompatible paths:

| Client | Project configuration |
| --- | --- |
| Codex | `.codex/config.toml` |
| Claude Code | `.mcp.json` |
| Antigravity CLI | `.agents/mcp_config.json` |

Configure built-in `Roblox_Studio` using Studio's existing launcher and configure
Chrrxs separately. On Windows, account for `cmd.exe /c`, npm shims, and the built-in
launcher's working directory. Chrrxs server and Studio plugin versions must match.
Reuse existing global entries where possible; do not overwrite unrelated global
configuration or commit tokens. Include Context7 for ongoing API documentation.
Keep default host permissions intact. Project trust and first-use client approvals
remain native client behavior, not bypassed by repository settings.

When multiple Studio windows are open, enumerate instances and explicitly route
every MCP operation to the intended local test place. Studio mutations of synced
code must be reflected in disk source; prefer disk edits with Rojo as authority.
No setup task should mutate or publish staging. Full MCP verification requires
Studio open with the built-in server enabled and matching Chrrxs plugin loaded.

## First-party conventions

Every authored Luau file begins with `--//LuauProgrammer`, `--//{ScriptName}`, and
`--//{YYYY-MM-DD}`; `--!strict` follows the header. Use PascalCase identifiers,
UPPER_SNAKE_CASE constants, and `_camelCase` private fields. Annotate public
interfaces and keep type checking strict; do not suppress errors with `any` or
blanket casts. Add comments only when they explain a non-obvious decision.
Prefer direct, small solutions and installed libraries; no speculative framework.

## Acceptance and evidence

1. A clean checkout installs pinned tools and all ten dependencies using the
   documented Aftman/Wally workflow; commands resolve the intended versions.
2. Formatting and strict Luau analysis pass with Roblox and dependency types.
3. Focused dry-run checks pass; both Rojo projects build successfully.
4. Inspect built places to verify two production entry points, package placement,
   shared production sources, and no local world/test content in staging output.
5. Validate native configuration syntax and agent discovery where supported by
   installed CLIs; test MCP handshakes and plugin installation where possible.
6. Perform an actual Studio startup/playtest if the local environment permits it.
   Report Studio toggles, client restarts, or unavailable runtime checks precisely.
7. Documentation links resolve locally and explain the full local-to-staging flow.

No remote push, staging sync, cloud upload, or publication is part of acceptance.

## Research sources

- [Rojo documentation](https://rojo.space/docs/v7/) and
  [stable releases](https://github.com/rojo-rbx/rojo/releases/latest).
- [Aftman upstream](https://github.com/LPGhatguy/aftman).
- [Wally registry](https://github.com/UpliftGames/wally-index).
- [Sleitnick Loader](https://github.com/Sleitnick/RbxUtil/tree/main/modules/loader).
- [Official ProfileStore manifest](https://github.com/MadStudioRoblox/ProfileStore/blob/main/wally.toml).
- [luau-lsp](https://github.com/JohnnyMorganz/luau-lsp) and
  [wally-package-types](https://github.com/JohnnyMorganz/wally-package-types).
- [Roblox Studio MCP](https://create.roblox.com/docs/studio/mcp) and
  [Roblox Windows connection guidance](https://github.com/Roblox/roblox-studio-agent-plugin/blob/main/skills/roblox-get-started/references/connect.md).
- [Chrrxs MCP](https://github.com/Chrrxs/robloxstudio-mcp).
- [Codex MCP](https://developers.openai.com/codex/mcp/) and
  [Codex custom agents](https://developers.openai.com/codex/subagents/).
- [Claude MCP](https://code.claude.com/docs/en/mcp-quickstart) and
  [Claude subagents](https://code.claude.com/docs/en/sub-agents).
- [Antigravity CLI MCP](https://antigravity.google/docs/mcp?tab=cli) and
  [custom agents](https://antigravity.google/docs/subagents?tab=cli).

Context7 was consulted for Rojo, Claude Code, and Antigravity CLI documentation.

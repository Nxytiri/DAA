# Department of Anomalous Affairs

Read [the document index](docs/README.md), then only the documents relevant to the task.
This is a Roblox programming repository for Blackridge Complex; no gameplay is implied by lore.

## Code rules

- Default to typed OOP for stateful systems; use plain functions for stateless utilities.
- Recover gracefully when safe; Init failures halt all remaining initialization and prevent Start.
- Use Ponytail ultra: the smallest complete solution. No speculative framework, wrappers, or services.
- Existing packages take precedence over native substitutes or custom implementations when they
  cover the behavior. Check `wally.toml` and [package responsibilities](docs/conventions.md#package-use).
  All Roblox diagnostics use Log (one logger per script/module); raw `print`/`warn` fail checks.
  Native code is allowed only for package bootstrapping, assertions, deliberate failure fixtures,
  or a documented runtime/API limitation. Document exceptions instead of silently bypassing packages.
- All first-party Luau is strict. Begin files with `--//LuauProgrammer`, `--//ScriptName`,
  `--//YYYY-MM-DD`, then `--!strict`. Use the current America/New_York date for new files.
- PascalCase identifiers; UPPER_SNAKE_CASE constants; `_camelCase` private fields.
- Annotate public interfaces. Do not hide errors behind `any`, blanket casts, or disabled diagnostics.
- Comments explain a non-obvious reason; avoid narrating the code.
- One server bootstrap and one client bootstrap. Startup modules are direct children of
  Services/Controllers, implement `Init(self): ()` and `Start(self): ()`, and have no require-time work or yields. Init is synchronous and fail-fast; Start uses isolated Promise error handlers.
- Use direct requires for dependencies. Shared helpers are explicitly required.
- Packages are in `ReplicatedStorage.DAA.Packages`; ProfileStore is in
  `ServerScriptService.DAA.Packages`. RemoteComm uses `Comm.ServerComm` / `Comm.ClientComm`.
  Input is client-only at runtime. Keep upstream sources and headers intact.
- Use Silo for application state stores and Option for public values that model absence.
  Ordinary local control-flow checks do not need to become state stores or Option objects.

## Commands and boundaries

Use PowerShell on Windows. Repository scripts prepend Aftman's bin before Rokit.
Run `.\scripts\Setup.ps1` after dependency changes and `.\scripts\Check.ps1` before completion.
Use luau-lsp for static checks, Lune for pure Luau and place inspection, Studio for engine tests.
Use Context7 or official upstream docs to confirm APIs before coding.

`default.project.json` is code-only. `local.project.json` adds the local baseplate and tests.
Never upload/publish the local place or map Workspace/world assets into staging.
Edit synced sources on disk and let Rojo apply them.
Before any MCP mutation, enumerate Studio windows and explicitly select the local test instance.
Staging sync requires the user's update-ready request, the intended cloud Studio instance,
and review of the code-only Rojo diff. This does not authorize publishing.

## Delegation

For nontrivial multi-file work, use the specialized luau-implementer, luau-reviewer, and
luau-verifier subagents in this client. Follow [the workflow](docs/agents.md).
Give each worker bounded context, owned paths, and acceptance criteria; avoid copying the full chat.
One writer per file set. Fresh review checks specification compliance first, then code quality.
Parallelize only independent ownership. Do not spawn agents for trivial edits.
Apply installed Superpowers workflows; do not assume another developer has the same skill paths.
Return changed paths, checks actually run, and unresolved limits. Never claim an unrun Studio test passed.

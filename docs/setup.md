# Setup and staging

## Requirements

Windows, Roblox Studio, Git, Node.js/npm, and [Aftman](https://github.com/LPGhatguy/aftman/releases).
Aftman 0.3.0 is the final upstream release and is unmaintained; this repo uses it by owner choice.
Install it with the release executable's `self-install` command.

From the repository in PowerShell:

```powershell
.\scripts\Setup.ps1 -StudioPlugins
.\scripts\Check.ps1
```

Aftman may request first-use trust for the six publishers in `aftman.toml`.
Review and approve the pinned tool sources using `aftman trust <owner/repository>`.
Setup installs Wally packages, Lune definitions, pinned Roblox definitions, exported package
types, the sourcemap, and the local place. `-StudioPlugins` installs matching Rojo and Chrrxs
plugins. Fully restart Studio after installing plugins.

Scripts prepend `~/.aftman/bin` in their process. They do not alter your global PATH.
For direct CLI commands in the current shell:

```powershell
. .\scripts\Environment.ps1
rojo --version
luau-lsp --version
```

This matters on machines where Rokit appears earlier on PATH. There is no Rokit manifest here.
VS Code recommends luau-lsp, StyLua, and Rojo extensions. Its sourcemap generator uses the
repository's Aftman environment. CLI checks provide LSP diagnostics to agents without native
Luau LSP integration.

## Local development

```powershell
.\scripts\Serve.ps1 -Target Local
```

Open `places/Baseplate.rbxlx`, then Save As `places/YourName.working.rbxlx`.
Connect the Rojo plugin to `127.0.0.1:34873`.
The tracked baseplate is reproducibly generated; never edit it manually.
Working copies are ignored. Commit Luau source, project files, manifests, lockfile, and docs.
Setup/Check rebuild the canonical place without overwriting working copies.

Check runs formatting, strict Roblox analysis, both place builds, and a Lune inspection of
their boundaries and script sources. Lune can dry-run pure Luau; it cannot validate engine
replication, DataStores, physics, or player input.

For Studio integration, start a local playtest. In the **server** and **client** runtime
contexts, run:

```luau
local Check = require(game:GetService("ReplicatedFirst").DAATests["Bootstrap.spec"])
Check()
Check("InitFailure")
Check("StartFailure")
```

The failure cases intentionally emit `EXPECTED_INIT_FAILURE` and `EXPECTED_START_FAILURE`.
They verify failure handling, not a clean-output production playtest. Tests use temporary
clones of the real bootstrap and destroy them afterward. Do not run them in staging.

## Stage an update

1. Commit and check the feature on the local place.
2. Stop the local Rojo server, then run `.\scripts\Serve.ps1 -Target Staging`.
3. Switch to the intended cloud staging place in Studio.
4. Connect Rojo to `127.0.0.1:34872`, verify project `DAA-Code`, and review the diff.
5. Sync only the DAA code/package folders. Publish from Studio separately when authorized.

`default.project.json` never maps Workspace, Lighting, SoundService, or local tests.
Unrelated instances are preserved at service boundaries. Inside owned DAA folders,
obsolete scripts may be removed so stale code does not survive a deployment.
There is no whole-place upload command or cloud credential in this repository.

## MCP connections

Restart each agent client after loading its repository config. Codex needs project trust;
Claude asks for project MCP approval. Antigravity CLI uses `.agents/mcp_config.json`,
not legacy Gemini settings or Claude's file.

The official `Roblox_Studio` launcher comes with Studio. Enable **Assistant → … →
Manage MCP Servers → Enable Studio as MCP server**. Chrrxs uses `daa-studio` and its
matching plugin version 3.4.3. Context7 uses its public HTTP endpoint; authentication
can be configured privately if your usage requires it.

```powershell
node scripts/TestMcp.mjs Roblox_Studio
node scripts/TestMcp.mjs daa-studio get_connected_instances
node --test tests/McpRouting.test.mjs
```

The first command lists tools; the second enumerates connected places.
The routing check confirms that unscoped Studio execution is rejected before dispatch.
The smoke client also accepts a tool name and JSON arguments, or `@path/to/calls.json`
containing an array of `{ "name": "...", "arguments": {} }` requests.
Keep a playtest sequence in one call so its temporary MCP server stays connected.
Only its own spawned process tree is stopped on exit.

Enumerate Studio instances before mutations and pass the exact instance ID to every
tool call. Local places have place ID zero; confirm their filename as well.
The helper preflights every scoped call in a sequence for an explicit instance ID.
Do not let an agent guess which of multiple Studio windows is safe to edit.
The Windows built-in launcher runs from its own directory; npm MCP servers use `cmd.exe /c`.
[Official Studio docs](https://create.roblox.com/docs/studio/mcp) and
[Chrrxs setup](https://github.com/Chrrxs/robloxstudio-mcp) describe their Studio-side controls.

# Department of Anomalous Affairs

Programming foundation for the Roblox game set at Blackridge Complex.

Start with [setup](docs/setup.md). [All documentation](docs/README.md) is indexed in one place.

```powershell
.\scripts\Setup.ps1 -StudioPlugins
.\scripts\Check.ps1
.\scripts\Serve.ps1 -Target Local
```

Open `places/Baseplate.rbxlx` in Studio and save your own `*.working.rbxlx` copy.
Local Rojo uses port **34873**. When an update is ready, serve **Staging** on **34872**
and connect the actual cloud staging place in Studio. Review the diff before syncing.
The staging mapping owns only DAA code/package folders; publishing remains a separate Studio action.

Windows tooling uses Aftman, Wally, Rojo, luau-lsp, Lune, and StyLua.
Codex and Antigravity read `AGENTS.md`; Claude imports it from `CLAUDE.md`.

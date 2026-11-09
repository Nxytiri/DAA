param([switch]$StudioPlugins)
. "$PSScriptRoot\Environment.ps1"

Invoke-Tool aftman @('install')
Invoke-Tool wally @('install')
Invoke-Tool lune @('setup')
New-Item -ItemType Directory -Path '.tools','build','places' -Force | Out-Null
Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/JohnnyMorganz/luau-lsp/1.70.1/scripts/globalTypes.d.luau' -OutFile '.tools/Roblox.d.luau'
Invoke-Tool rojo @('sourcemap','local.project.json','-o','sourcemap.json')
Invoke-Tool wally-package-types @('--sourcemap','sourcemap.json','Packages')
Invoke-Tool wally-package-types @('--sourcemap','sourcemap.json','ServerPackages')
Invoke-Tool rojo @('build','local.project.json','-o','places/Baseplate.rbxlx')
if ($StudioPlugins) {
    Invoke-Tool rojo @('plugin','install')
    Invoke-Tool 'npx.cmd' @('-y','@chrrxs/robloxstudio-mcp@3.4.3','--install-plugin')
}

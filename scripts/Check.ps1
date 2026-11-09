. "$PSScriptRoot\Environment.ps1"

Invoke-Tool stylua @('--check','src','tests')
Invoke-Tool rojo @('sourcemap','local.project.json','-o','sourcemap.json')
Invoke-Tool luau-lsp @('analyze','--platform=roblox','--definitions=.tools/Roblox.d.luau','--sourcemap=sourcemap.json','--ignore=**/Packages/**','--ignore=**/ServerPackages/**','src','tests/Studio','tests/Fixtures','tests/Failures')
Invoke-Tool luau-lsp @('analyze','--platform=standard','tests/VerifyPlace.luau')
New-Item -ItemType Directory -Path 'build' -Force | Out-Null
Invoke-Tool rojo @('build','default.project.json','-o','build/Staging.rbxlx')
Invoke-Tool rojo @('build','local.project.json','-o','places/Baseplate.rbxlx')
Invoke-Tool lune @('run','tests/VerifyPlace.luau')

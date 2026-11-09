. "$PSScriptRoot\Environment.ps1"
Invoke-Tool rojo @('sourcemap','local.project.json','-o','sourcemap.json')

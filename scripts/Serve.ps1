param([ValidateSet('Local','Staging')][string]$Target = 'Local')
. "$PSScriptRoot\Environment.ps1"

$Project = if ($Target -eq 'Local') { 'local.project.json' } else { 'default.project.json' }
Invoke-Tool rojo @('serve',$Project,'--address','127.0.0.1')

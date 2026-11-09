$ErrorActionPreference = 'Stop'
$RepositoryRoot = Split-Path -Parent $PSScriptRoot
$AftmanBin = Join-Path $env:USERPROFILE '.aftman\bin'
if (-not (Test-Path -LiteralPath (Join-Path $AftmanBin 'aftman.exe'))) {
    throw 'Install Aftman first: https://github.com/LPGhatguy/aftman/releases'
}
$env:PATH = "$AftmanBin;$env:PATH"
Set-Location -LiteralPath $RepositoryRoot

function Invoke-Tool {
    param([Parameter(Mandatory)][string]$Name, [string[]]$Arguments = @())
    & $Name @Arguments
    if ($LASTEXITCODE -ne 0) { throw "$Name failed with exit code $LASTEXITCODE" }
}

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

function RunCheck(FileName, Source) {
  const Temp = resolve(tmpdir());
  const Root = mkdtempSync(join(Temp, "daa-check-tests-"));
  try {
    for (const Directory of ["scripts", "src", "tests/Studio", "tests/Fixtures", "tests/Failures", "places"]) {
      mkdirSync(join(Root, Directory), { recursive: true });
    }
    for (const File of ["scripts/Check.ps1", "aftman.toml", "selene.toml", "package-policy.yml"]) {
      copyFileSync(fileURLToPath(new URL("../" + File, import.meta.url)), join(Root, File));
    }
    // Keep real Check argument handling and Selene; other pipeline tools are unrelated to this regression.
    writeFileSync(join(Root, "scripts", "Environment.ps1"), `
$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Split-Path -Parent $PSScriptRoot)
function Invoke-Tool {
    param([string]$Name, [string[]]$Arguments)
    if ($Name -eq 'selene') { & (Join-Path $env:USERPROFILE '.aftman\\bin\\selene.exe') @Arguments }
    elseif ($Name -eq 'node') { & $env:DAA_TEST_NODE @Arguments }
    else { return }
    if ($LASTEXITCODE -ne 0) { throw "$Name failed with exit code $LASTEXITCODE" }
}
`);
    for (const File of ["McpDiscovery.test.mjs", "Additional.test.mjs"]) {
      writeFileSync(join(Root, "tests", File), `import { writeFileSync } from "node:fs"; writeFileSync(${JSON.stringify(File + ".ran")}, "ran");`);
    }
    writeFileSync(join(Root, "src", FileName), Source);
    const ChildEnvironment = { ...process.env, DAA_TEST_NODE: process.execPath };
    delete ChildEnvironment.NODE_TEST_CONTEXT;
    const Result = spawnSync("powershell.exe", ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", join(Root, "scripts", "Check.ps1")],
      { encoding: "utf8", windowsHide: true, timeout: 15000, env: ChildEnvironment });
    return { ...Result, discoveryRan: existsSync(join(Root, "McpDiscovery.test.mjs.ran")), additionalRan: existsSync(join(Root, "Additional.test.mjs.ran")) };
  } finally {
    assert.equal(dirname(resolve(Root)), Temp);
    assert.ok(basename(Root).startsWith("daa-check-tests-"));
    rmSync(Root, { recursive: true });
  }
}

test("Check executes every top-level Node regression", () => {
  const Result = RunCheck("Valid.luau", "return {}\n");
  assert.equal(Result.status, 0, Result.stderr);
  assert.equal(Result.discoveryRan, true);
  assert.equal(Result.additionalRan, true);
});

for (const Extension of ["lua", "luau"]) {
  for (const [Name, Source] of [
    ["print", 'print("policy fixture")'],
    ["warn", 'warn("policy fixture")'],
    ["print alias", 'local NativeLog = print\nNativeLog("policy fixture")'],
    ["warn alias", 'local NativeLog = warn\nNativeLog("policy fixture")'],
  ]) {
    test(`Check rejects ${Name} in .${Extension}`, () => {
      const Result = RunCheck("Policy." + Extension, Source + "\n");
      assert.equal(Result.status, 1, Result.stderr);
      assert.match(Result.stdout + Result.stderr, /error\[undefined_variable\]/);
      assert.equal(Result.discoveryRan, false);
    });
  }
}

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

function RunColdServer(Arguments) {
  const Root = mkdtempSync(join(tmpdir(), "daa-mcp-tests-"));
  try {
    mkdirSync(join(Root, "scripts"));
    copyFileSync(fileURLToPath(new URL("../scripts/TestMcp.mjs", import.meta.url)), join(Root, "scripts", "TestMcp.mjs"));
    const ServerPath = join(Root, "server.mjs");
    writeFileSync(ServerPath, `
import { createInterface } from "node:readline";
let Lists = 0;
const Tools = [
  { name: "list_roblox_studios", inputSchema: { properties: {} } },
  { name: "get_studio_state", inputSchema: { properties: { studio_id: { type: "string" } } } },
];
createInterface({ input: process.stdin }).on("line", (Line) => {
  const Message = JSON.parse(Line);
  if (!Message.id) return;
  let Result;
  if (Message.method === "initialize") Result = { serverInfo: { name: "cold-studio-fixture" } };
  else if (Message.method === "tools/list") Result = { tools: ++Lists === 1 ? [] : Tools };
  else if (Message.params.name === "list_roblox_studios") {
    Result = { content: [{ type: "text", text: JSON.stringify({ studios: [{ id: "local-fixture" }] }) }] };
  } else Result = { content: [{ type: "text", text: Message.params.arguments.studio_id }] };
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: Message.id, result: Result }) + "\\n");
});
`);
    writeFileSync(join(Root, ".mcp.json"), JSON.stringify({
      mcpServers: { Roblox_Studio: { command: process.execPath, args: [ServerPath] } },
    }));
    return spawnSync(process.execPath, [join(Root, "scripts", "TestMcp.mjs"), "Roblox_Studio", ...Arguments],
      { encoding: "utf8", windowsHide: true, timeout: 10000 });
  } finally {
    assert.equal(dirname(Root), tmpdir());
    assert.ok(basename(Root).startsWith("daa-mcp-tests-"));
    rmSync(Root, { recursive: true });
  }
}

test("waits for the Studio catalog before validating scoped requests", () => {
  const Result = RunColdServer(["get_studio_state", '{"studio_id":"local-fixture"}']);
  assert.equal(Result.status, 0, Result.stderr);
  assert.equal(JSON.parse(Result.stdout).result.content[0].text, "local-fixture");
});

test("waits for tools instead of reporting an empty cold catalog as success", () => {
  const Result = RunColdServer([]);
  assert.equal(Result.status, 0, Result.stderr);
  assert.equal(JSON.parse(Result.stdout).result.tools.length, 2);
});

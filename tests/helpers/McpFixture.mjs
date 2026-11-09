import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function RunMcpFixture(ServerName, Calls = [], ColdCatalog = false) {
  const Temp = resolve(tmpdir());
  const Root = mkdtempSync(join(Temp, "daa-mcp-tests-"));
  try {
    mkdirSync(join(Root, "scripts"));
    copyFileSync(fileURLToPath(new URL("../../scripts/TestMcp.mjs", import.meta.url)), join(Root, "scripts", "TestMcp.mjs"));
    const ServerPath = join(Root, "server.mjs");
    const DispatchPath = join(Root, "dispatch.jsonl");
    writeFileSync(ServerPath, `
import { appendFileSync } from "node:fs";
import { createInterface } from "node:readline";
let Lists = 0;
const Tools = [
  { name: "list_roblox_studios", inputSchema: { type: "object", properties: {} } },
  { name: "get_connected_instances", inputSchema: { type: "object", properties: {} } },
  { name: "get_studio_state", inputSchema: { type: "object", properties: { studio_id: { type: "string" } } } },
  { name: "execute_luau", inputSchema: { type: "object", properties: { code: { type: "string" }, instance_id: { type: "string" } }, required: ["code"] } },
  { name: "multiplayer_playtest", inputSchema: { type: "object", properties: { multiplayer_group_id: { type: "string" } } } },
  { name: "manage_instance", inputSchema: { type: "object", properties: {
    action: { type: "string", enum: ["launch", "authorize", "complete", "close", "status", "list_place_versions"] },
    source: { type: "string", enum: ["baseplate", "local_file", "published_place", "place_revision"] },
    local_place_file: { type: "string" }, place_id: { type: "number" },
    instance_id: { type: "string" }, launch_id: { type: "string" },
  }, required: ["action"] } },
];
createInterface({ input: process.stdin }).on("line", (Line) => {
  const Message = JSON.parse(Line);
  if (!Message.id) return;
  let Result;
  if (Message.method === "initialize") Result = { serverInfo: { name: "isolated-studio-fixture", version: "1.0.0" }, capabilities: {}, protocolVersion: "2024-11-05" };
  else if (Message.method === "tools/list") Result = { tools: ++Lists === 1 && process.argv[3] === "true" ? [] : Tools };
  else {
    appendFileSync(process.argv[2], JSON.stringify(Message.params) + "\\n");
    if (Message.params.name === "list_roblox_studios") Result = { content: [{ type: "text", text: JSON.stringify({ studios: [{ id: "local-fixture" }] }) }] };
    else if (Message.params.name === "get_connected_instances") Result = { structuredContent: { instances: [{ id: "local-fixture" }] }, content: [] };
    else Result = { content: [{ type: "text", text: JSON.stringify(Message.params.arguments) }] };
  }
  process.stdout.write(JSON.stringify({ jsonrpc: "2.0", id: Message.id, result: Result }) + "\\n");
});
`);
    writeFileSync(join(Root, ".mcp.json"), JSON.stringify({
      mcpServers: { [ServerName]: { command: process.execPath, args: [ServerPath, DispatchPath, String(ColdCatalog)] } },
    }));
    const CallsPath = join(Root, "calls.json");
    writeFileSync(CallsPath, JSON.stringify(Calls));
    const Result = spawnSync(process.execPath, [join(Root, "scripts", "TestMcp.mjs"), ServerName, ...(Calls.length ? ["@" + CallsPath] : [])],
      { encoding: "utf8", windowsHide: true, timeout: 10000 });
    return { ...Result, dispatches: existsSync(DispatchPath) ? readFileSync(DispatchPath, "utf8").trim().split("\n").map(JSON.parse) : [] };
  } finally {
    assert.equal(dirname(resolve(Root)), Temp);
    assert.ok(basename(Root).startsWith("daa-mcp-tests-"));
    rmSync(Root, { recursive: true });
  }
}

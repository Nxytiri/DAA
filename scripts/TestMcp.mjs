import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline";

const [ServerName = "Roblox_Studio", ToolName, RawArguments = "{}"] = process.argv.slice(2);
const Config = JSON.parse(readFileSync(new URL("../.mcp.json", import.meta.url), "utf8"));
const Server = Config.mcpServers[ServerName];
if (!Server?.command) throw new Error("Select a local stdio server from .mcp.json");
const ToolArguments = JSON.parse(RawArguments);
const Child = spawn(Server.command, Server.args, { windowsHide: true, stdio: ["pipe", "pipe", "pipe"] });
const Pending = new Map();
let NextId = 0;
const Lines = createInterface({ input: Child.stdout });
Child.stderr.pipe(process.stderr);
Lines.on("line", (Line) => {
  let Message;
  try { Message = JSON.parse(Line); } catch { return; }
  const Request = Pending.get(Message.id);
  if (!Request) return;
  Pending.delete(Message.id);
  clearTimeout(Request.timer);
  if (Message.error) Request.reject(new Error(JSON.stringify(Message.error)));
  else Request.resolve(Message.result);
});
function RejectPending(ErrorValue) {
  for (const Request of Pending.values()) {
    clearTimeout(Request.timer);
    Request.reject(ErrorValue);
  }
  Pending.clear();
}
Child.on("error", RejectPending);
Child.on("exit", (Code) => RejectPending(new Error("MCP process exited: " + Code)));
function Request(Method, Params) {
  const Id = ++NextId;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      Pending.delete(Id);
      reject(new Error("MCP request timed out: " + Method));
    }, 45000);
    Pending.set(Id, { resolve, reject, timer });
    Child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: Id, method: Method, params: Params }) + "\n");
  });
}
try {
  const Init = await Request("initialize", {
    protocolVersion: "2024-11-05",
    capabilities: {},
    clientInfo: { name: "daa-smoke-check", version: "1.0.0" },
  });
  Child.stdin.write(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }) + "\n");
  const Calls = ToolName?.startsWith("@")
    ? JSON.parse(readFileSync(ToolName.slice(1), "utf8"))
    : ToolName ? [{ name: ToolName, arguments: ToolArguments }] : [];
  const CatalogDeadline = Date.now() + 20000;
  let Catalog = await Request("tools/list", {});
  while (!Catalog.tools?.length && Date.now() < CatalogDeadline) {
    await new Promise((Resolve) => setTimeout(Resolve, 1000));
    Catalog = await Request("tools/list", {});
  }
  if (!Catalog.tools?.length) throw new Error("No Studio tools available; open Studio and enable its MCP server");
  for (const Call of Calls) {
    const Tool = Catalog.tools.find((Item) => Item.name === Call.name);
    if (!Tool) throw new Error("Unknown MCP tool: " + Call.name);
    let Routes = ["instance_id", "studio_id", "multiplayer_group_id"]
      .filter((Field) => Field in (Tool.inputSchema?.properties ?? {}));
    if (Call.name === "manage_instance") {
      const Action = Call.arguments?.action;
      if (Call.arguments?.instance_id && Call.arguments?.launch_id) {
        throw new Error(Call.name + " requires exactly one explicit instance_id or launch_id");
      }
      if (Action === "launch" || Action === "list_place_versions") continue;
      if (Action === "authorize" || Action === "complete") Routes = ["launch_id"];
      if (Action === "close" || Action === "status") Routes = ["instance_id", "launch_id"];
    }
    if (Routes.length && !Routes.some((Field) =>
      typeof Call.arguments?.[Field] === "string" && Call.arguments[Field].trim())) {
      throw new Error(Call.name + " requires an explicit " + Routes.join(" or "));
    }
  }
  // Studio plugins reconnect on a backoff after this temporary server starts.
  if (ServerName === "daa-studio" && ToolName) {
    const Deadline = Date.now() + 20000;
    while (Date.now() < Deadline) {
      const Connections = await Request("tools/call", { name: "get_connected_instances", arguments: {} });
      if (Connections.structuredContent?.instances?.length) break;
      await new Promise((Resolve) => setTimeout(Resolve, 1000));
    }
  }
  if (ServerName === "Roblox_Studio" && ToolName) {
    const Deadline = Date.now() + 20000;
    while (Date.now() < Deadline) {
      const Connections = await Request("tools/call", { name: "list_roblox_studios", arguments: {} });
      const Text = Connections.content?.find((Item) => Item.type === "text")?.text;
      if (Text && JSON.parse(Text).studios?.length) break;
      await new Promise((Resolve) => setTimeout(Resolve, 1000));
    }
  }
  const Results = [];
  for (const Call of Calls) {
    const Value = await Request("tools/call", Call);
    Results.push({ name: Call.name, ...Value });
    if (Value.isError) process.exitCode = 1;
  }
  const Result = Calls.length ? (ToolName.startsWith("@") ? Results : Results[0]) : Catalog;
  console.log(JSON.stringify({ server: Init.serverInfo, result: Result }, null, 2));
} catch (ErrorValue) {
  console.error(ErrorValue.message);
  process.exitCode = 1;
} finally {
  Lines.close();
  if (process.platform === "win32" && Child.pid) {
    spawnSync("taskkill", ["/PID", String(Child.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
  } else {
    Child.kill();
  }
}

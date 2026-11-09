import assert from "node:assert/strict";
import test from "node:test";
import { RunMcpFixture } from "./helpers/McpFixture.mjs";

test("waits for the Studio catalog before validating scoped requests", () => {
  const Result = RunMcpFixture("Roblox_Studio", [
    { name: "get_studio_state", arguments: { studio_id: "local-fixture" } },
  ], true);
  assert.equal(Result.status, 0, Result.stderr);
  assert.deepEqual(JSON.parse(JSON.parse(Result.stdout).result[0].content[0].text), { studio_id: "local-fixture" });
});

test("waits for tools instead of reporting an empty cold catalog as success", () => {
  const Result = RunMcpFixture("Roblox_Studio", [], true);
  assert.equal(Result.status, 0, Result.stderr);
  assert.ok(JSON.parse(Result.stdout).result.tools.some((Tool) => Tool.name === "get_studio_state"));
});

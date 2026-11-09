import assert from "node:assert/strict";
import test from "node:test";
import { RunMcpFixture } from "./helpers/McpFixture.mjs";

for (const Arguments of [
  { action: "launch", source: "baseplate" },
  { action: "list_place_versions", place_id: 123 },
  { action: "authorize", launch_id: "owned-launch" },
  { action: "complete", launch_id: "owned-launch" },
  { action: "status", launch_id: "owned-launch" },
  { action: "close", launch_id: "owned-launch" },
  { action: "status", instance_id: "local-fixture" },
  { action: "close", instance_id: "local-fixture" },
]) {
  test("accepts lifecycle request " + JSON.stringify(Arguments), () => {
    const Call = { name: "manage_instance", arguments: Arguments };
    const Result = RunMcpFixture("daa-studio", [Call]);
    assert.equal(Result.status, 0, Result.stderr);
    assert.deepEqual(JSON.parse(JSON.parse(Result.stdout).result[0].content[0].text), Arguments);
    assert.ok(Result.dispatches.some((Dispatched) => Dispatched.name === Call.name));
  });
}

for (const Arguments of [
  { action: "status" },
  { action: "close", launch_id: " " },
  { action: "status", instance_id: "local-fixture", launch_id: "owned-launch" },
  { action: "close", instance_id: "local-fixture", launch_id: "owned-launch" },
  { action: "authorize", instance_id: "local-fixture" },
  { action: "complete", instance_id: "local-fixture" },
]) {
  test("rejects lifecycle request before dispatch " + JSON.stringify(Arguments), () => {
    const Result = RunMcpFixture("daa-studio", [{ name: "manage_instance", arguments: Arguments }]);
    assert.equal(Result.status, 1, Result.stderr);
    assert.match(Result.stderr, /requires.*(?:instance_id|launch_id)/);
    assert.deepEqual(Result.dispatches, []);
  });
}

for (const [ServerName, Call, Route] of [
  ["daa-studio", { name: "execute_luau", arguments: { code: "return game.PlaceId" } }, "instance_id"],
  ["Roblox_Studio", { name: "get_studio_state", arguments: {} }, "studio_id"],
  ["daa-studio", { name: "multiplayer_playtest", arguments: {} }, "multiplayer_group_id"],
]) {
  test("rejects unscoped " + Call.name + " before dispatch", () => {
    const Result = RunMcpFixture(ServerName, [Call]);
    assert.equal(Result.status, 1, Result.stderr);
    assert.ok(Result.stderr.includes(Route), Result.stderr);
    assert.deepEqual(Result.dispatches, []);
  });
}

test("preflights the entire sequence before dispatching scoped execution", () => {
  const Result = RunMcpFixture("daa-studio", [
    { name: "execute_luau", arguments: { instance_id: "local-fixture", code: "return game.PlaceId" } },
    { name: "execute_luau", arguments: { code: "return game.PlaceId" } },
  ]);
  assert.equal(Result.status, 1, Result.stderr);
  assert.deepEqual(Result.dispatches, []);
});

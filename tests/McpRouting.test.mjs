import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

test("rejects Studio execution without an explicit instance ID", () => {
  const Result = spawnSync(process.execPath, [
    fileURLToPath(new URL("../scripts/TestMcp.mjs", import.meta.url)),
    "daa-studio", "execute_luau", '{"code":"return game.PlaceId"}',
  ], { encoding: "utf8", windowsHide: true, timeout: 30000 });
  assert.equal(Result.status, 1, Result.stderr);
  assert.match(Result.stderr, /requires an explicit instance_id/);
});

# Architecture

## Ownership

- `ServerScriptService.DAA`: server bootstrap, Services, and server-only Packages.
- `StarterPlayer.StarterPlayerScripts.DAA`: client bootstrap and Controllers.
- `ReplicatedStorage.DAA`: Shared modules/types and shared Packages.
- `ReplicatedFirst.DAATests`: local test harness only; absent from staging.

There is one production server Script and one client LocalScript. Other authored runtime
files are ModuleScripts. Helpers live outside the flat startup folder or in nested folders
and are explicitly required. Shared code never imports server-only data.

## Lifecycle

Each bootstrap performs these phases:

1. **Require:** Sleitnick Loader requires every direct ModuleScript in its startup folder.
   It waits for each require to return; every require finishes before any hook executes.
2. **Init:** call each module's `Init(self)` synchronously. Every Init finishes before Start.
3. **Start:** dispatch each module's `Start(self)` in its own Promise coroutine.
   One yielding or failed Start does not prevent other Start hooks from running.

Both hooks are required and return `()`; use an empty hook when unnecessary.
The exported `Types.Startup` type documents the interface.
Module enumeration has no defined dependency order. Require dependencies directly and avoid
cycles. Init may rely on all module tables being loaded, not on another Init running first.
Start may rely on all Init hooks having completed. Background tasks created inside Init
are not automatically awaited; finish required initialization before returning.

A require or Init error is a hard error: the bootstrap halts and invokes no Start hooks.
Earlier Init effects are not rolled back. Prefer validation and state setup in Init;
acquire running connections/tasks in Start so a failed initialization does not leave a
half-running service. A non-terminating require/Init blocks startup by design.

Start failures are caught through Promise and reported by Log with their module name. Recoverable
runtime failures should have explicit fallbacks, bounded retries, cleanup, and logging.
Never swallow an error and leave corrupt state. A catch attached to a Start Promise does
not catch detached `task.spawn` callbacks or unreturned Promises: those owners must handle
their own errors. Put critical startup checks in Init; critical runtime invariants may hard-error.

## Systems and communication

Prefer typed objects for stateful systems, with private state and explicit ownership.
Use direct requires to communicate within a runtime, Signal for local events, and Comm's
`ServerComm`/`ClientComm` for remotes (the requested RemoteComm library).
Validate client payloads, permissions, and rate limits on the server.
Use Input on the client only; use Trove for owned connections/tasks/instances.
ProfileStore stays server-only and is installed without inventing a player-data schema.

All eighteen requested libraries are pinned in `wally.toml`.
When a feature needs a package's responsibility, that package is mandatory instead of a
native substitute or competing implementation. See [package-use enforcement](conventions.md#package-use).

## Rojo boundary

The local project references the code project and adds only Workspace fixtures and the
test service. Rojo appends project children; it does not merge same-named service nodes
from two projects. Keep local additions in services absent from the code project.
The automated place inspection checks that production sources match across both builds.
Upstream package files, including upstream tests and headers, are retained unchanged.

# Programming conventions

Apply these rules to first-party code. Preserve third-party package authorship and licenses.

## Strict Luau and naming

Begin every authored Luau file with:

```luau
--//LuauProgrammer
--//ExampleService
--//2026-11-08
--!strict
```

Use the actual creation date in America/New_York; do not rewrite dates on every edit.
Public identifiers and ordinary locals use PascalCase. Constants use UPPER_SNAKE_CASE,
for example `local MAX_ATTEMPTS = 3`. Private fields use `_camelCase`.
Luau's implicit `self` and type-parameter names follow normal language conventions.
Annotate public inputs, outputs, and object types. Do not use `any` or casts to suppress
diagnostics. Runtime validation still belongs at untrusted boundaries.

## OOP first

Stateful systems should be typed module classes: a constructor creates an object with
owned state; methods express its behavior. Prefer composition and direct references.
Define the public object type and annotate method `self` consistently.
Use explicit cleanup for resources the object owns, usually through Trove.

A service/controller can be a singleton object with Init and Start hooks. Stateless
helpers can remain functions. Avoid inheritance trees, class registries, a custom class
framework, dependency injection containers, and getters that add no behavior.
Use Silo for application state stores and Option for public values that model absence.
Ordinary local control-flow checks remain normal Luau checks.

## Package use

Use an installed package whenever it covers the behavior being implemented. Do not replace
it with a native substitute, copy its implementation, or build a competing abstraction.
Check the installed version and API before coding. Adding a feature does not mean eagerly
constructing every package: use each one when its responsibility is needed.

| Responsibility | Required package |
| --- | --- |
| Roblox diagnostics, severity, contextual error reports | Log; one logger per script/module |
| Owned connections, tasks, instances, and cleanup | Trove |
| Local events | Signal |
| Async composition, cancellation, recoverable failures | Promise |
| Client/server remotes | Comm / ServerComm / ClientComm |
| Player input | Input, on the client |
| Tag-based component lifecycle | Component |
| Spring motion and camera shake | Spring and Shake |
| Custom enumerations | EnumList |
| Startup module discovery | Loader |
| Instance-tree navigation and async instance availability | Tree and WaitFor |
| Table operations covered by the installed API | TableUtil |
| Recurring timers | Timer |
| Application state stores | Silo |
| Public optional values | Option |
| Persistent profiles and session ownership | ProfileStore, server only |

`scripts/Check.ps1` runs Selene with `package-policy.yml`: raw `print` and `warn`,
including multiline aliases of those globals, are undefined in the first-party Roblox
standard library. Both `.lua` and `.luau` files are checked. Removing these globals avoids
Selene's line-sensitive deprecation analysis; use Log instead of declaring them locally.
Other package responsibilities require semantic review; implementers and reviewers must check
the table above. Do not suppress the lint to bypass this policy.

Exceptions are narrow: native APIs needed to obtain the packages themselves (such as bootstrap
`WaitForChild`), assertion primitives and deliberate failure/scheduling fixtures in tests,
and host tools that cannot run Roblox packages (PowerShell, Node, Lune). Host stdout remains
native. Preserve vendor sources, including their internal uses of native APIs. Record any
additional runtime/API incompatibility in the affected system document and explain it in review.

## Errors and comments

Graceful recovery is the default when a safe fallback exists. Catch expected Promise
rejections at the owning boundary, log useful context, and leave consistent state.
Use hard errors for Init failures and critical invariants; never catch Init errors to
continue starting the remaining modules. Do not blindly retry programming errors or
treat client-provided data as trusted. See [lifecycle guarantees](architecture.md).

Use short comments for a non-obvious reason, constraint, or complex segment. Do not
narrate obvious statements or add decorative comment walls.
Ponytail ultra means the smallest complete solution: reuse the platform and installed
libraries, question unjustified abstractions, and test actual behavior.
Run StyLua and `scripts/Check.ps1` before calling a change complete.

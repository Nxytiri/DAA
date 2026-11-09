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
Use Silo when a system needs observable state and Option when explicit optional values
make nil handling safer. These are available tools, not a requirement to wrap every field.

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

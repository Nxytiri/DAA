# Agent workflow

## Native configuration

| Client | Instructions | MCP | Specialized agents |
| --- | --- | --- | --- |
| Codex | AGENTS.md | .codex/config.toml | .codex/agents/*.toml |
| Claude Code | CLAUDE.md imports AGENTS.md | .mcp.json | .claude/agents/*.md |
| Antigravity CLI | AGENTS.md | .agents/mcp_config.json | .agents/agents/*.md |

Codex uses current standalone agent TOML files with name, description, and
developer_instructions. It inherits parent permissions and MCPs; custom role files
cannot override those policies. Claude uses its own YAML fields; reviewer tools are
limited to Read/Grep/Glob. Antigravity uses its own tool names and subagent flag.
These restrictions are client-specific, not interchangeable permission schemas.
Models inherit the developer's session preference; no model/provider is forced by the repo.

Native tools may load only when a client starts or a project is trusted. Existing global
servers can collide with project names, especially in Antigravity, where a running server
can retain its name. Keep one official Roblox_Studio registration, inspect /mcp, and remove
a duplicate through the client if needed; do not overwrite global configuration files.

## Roles and bounded context

- **luau-implementer:** owns the assigned files, implements typed OOP-first code and focused checks.
- **luau-reviewer:** reads connected code and reports findings without editing.
- **luau-verifier:** runs static, build, Lune, and local Studio checks and reports evidence.

For a nontrivial multi-file task, the coordinator follows the installed Superpowers
design/plan workflow. Dispatch a narrow worker with: purpose, relevant spec paths, owned
files, exact acceptance criteria, and necessary interfaces. Use a clean context rather
than copying the whole chat. One writer owns each file set.

Include the base/head diff or changed-file excerpts, relevant external API documentation,
and verification results in review handoffs. Restricted Claude and Antigravity reviewers
have file-reading tools; the coordinator supplies shell/MCP evidence instead of granting
them mutation capabilities. Reviewers must flag missing evidence rather than invent results.

After implementation, use a fresh reviewer for specification compliance. Resolve findings,
then use a fresh quality review for correctness, security, error handling, typing, cleanup,
and unnecessary complexity. Use the verifier for checks with noisy logs. Parallelize only
independent ownership. Small edits do not need a team.

Return changed paths, command/results, concrete findings, and unrun checks. Keep long logs
in ignored scratch directories. Update this index when a real system needs documentation.
No role may deploy staging or publish as a side effect of implementation or testing.

## Superpowers installation

Install the real plugin per client; this repository does not vendor a partial copy.
The current installed Superpowers README documents:

- Codex app: Plugins → Superpowers → install. Codex CLI: `/plugins`, search Superpowers.
- Claude Code: `/plugin install superpowers@claude-plugins-official`.
- Antigravity CLI: `agy plugin install https://github.com/obra/superpowers`.

Follow [the upstream installation instructions](https://github.com/obra/superpowers)
when installing or updating. Repository role prompts remain useful when the plugin is
unavailable, but should not claim its skills were installed or invoked.

## Source references

Current formats were checked against
[Codex custom agents](https://developers.openai.com/codex/subagents/),
[Claude subagents](https://code.claude.com/docs/en/sub-agents), and
[Antigravity CLI subagents](https://antigravity.google/docs/subagents?tab=cli).
Use Context7 and primary docs when updating these files.

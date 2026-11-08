# MCP verification

Verified November 8, 2026.

The retest used the existing server, Python 3.12 environment, and Codex registration. See [baseline hashes](request-baseline-hashes.json) for the files checked.

All four original prompt logs were downloaded again through the GitHub connector at commit `d3e7a6cc629cce90ca7fe16a8feecf386f599ec3`. Their bytes, including original line endings and BOM where present, matched the original Git blob hashes before saving with distinct filenames. Source paths and hashes are in `../logs/SOURCES.json`.

`pip install -r mcp/requirements.txt` succeeded with requirements already satisfied. `pip check` reported no broken requirements. Pip warned that its cache directory was not writable; installation verification still succeeded. The existing six unit tests passed.

The actual stdio server started from `/tmp`, advertised exactly one tool (`search_past_bugs`), and answered the camera query. No-match behavior passed; a blank query was rejected as intended. See `request-mcp-smoke.json` and its stderr file.

The first fresh Codex CLI attempt failed before initialization: `failed to initialize in-process app-server client: Operation not permitted (os error 1)`. It also reported unwritable local state. It did not invoke the tool. See `request-codex-camera.stderr.txt`.

A retry with approved execution outside the filesystem sandbox used a fresh ephemeral, read-only Codex session and the existing user configuration. The JSONL contains an observed `item.completed` / `mcp_tool_call` event for server `hw8-past-bugs`, tool `search_past_bugs`, arguments `{"query":"camera"}`, status `completed`, error `null`, and actual returned text. See `request-codex-camera-retry.jsonl`. Startup/state warnings in stderr did not prevent that successful call. No approval-policy bypass was used.

The tool reported 24 matching lines and returned its first 20 passages (the configured limit), all from `crossy-road-prompt-log.txt`; `truncated` was true and `warnings` was empty. The exact returned result is in `request-camera-results.json`.

Search is literal, case-insensitive, and requires all whitespace-separated terms on the same line. It retrieves historical text; it does not classify whether each match is a bug or prove any historical fix worked. Existing chats do not gain the tool automatically; this verification is specifically an observed call in a newly launched Codex CLI session.

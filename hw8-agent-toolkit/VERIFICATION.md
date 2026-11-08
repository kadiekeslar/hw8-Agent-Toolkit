# Observed setup verification

Run date: November 8, 2026. These are toolkit setup checks, not completed assignment demonstrations or personal reflections.

| Check | Actual result | Evidence |
| --- | --- | --- |
| Original log retrieval | Four logs fetched through the GitHub connector at commit `d3e7a6cc629cce90ca7fe16a8feecf386f599ec3`; reconstructed bytes match each original Git blob SHA | `logs/SOURCES.json` |
| YAML/frontmatter | All eight real skills passed the bundled skill-creator validator and local YAML validation | `evidence/bundled-skill-validator.txt`, `evidence/skills-validation.txt` |
| Codex discovery | Codex `debug prompt-input` exposes all eight skill names, descriptions, and paths | `evidence/skill-discovery.json` |
| Skill loading | Read-only Codex smoke sessions explicitly invoked feature-check and reported using it | `evidence/codex-mcp-smoke.jsonl`, `evidence/codex-mcp-retest.jsonl` |
| Unit tests | Six tests passed: passages/line numbers, term matching/no-match/literal input, invalid input, empty/missing corpus, result cap/read warning, external symlink exclusion | `evidence/unit-tests.txt` |
| Actual stdio server | Client launched server from `/tmp`; discovered exactly `search_past_bugs`; camera query returned results; no-match and blank-query rejection checks passed | `evidence/mcp-smoke.json`, `evidence/mcp-smoke.stderr.txt`, `scripts/verify_mcp.py` |
| Local installation | Python 3.12 virtual environment, FastMCP 4.1.6, PyYAML 6.0.3; `pip check` found no broken requirements | `mcp/requirements.txt`, `evidence/pip-check.txt` |
| Codex registration | `codex mcp add` added the previously absent `hw8-past-bugs` entry with absolute interpreter and script paths | `evidence/mcp-registration.json` |
| Codex actual tool execution | Retest contains completed `mcp_tool_call` for server `hw8-past-bugs`, tool `search_past_bugs`, query `camera`, with returned passages and no error | `evidence/codex-mcp-retest.jsonl` |

## Observed setup failure and correction

The first actual Codex call failed with `MCP tool call requires approval, but approval policy is never`. Its JSONL records a failed tool call, not a successful search. The search function was read-only but its MCP decorator did not advertise that property.

Revision: added accurate `readOnlyHint`, `destructiveHint`, `idempotentHint`, and `openWorldHint` annotations to `mcp/bug_search.py`. Added an assertion in the stdio check that the advertised tool is read-only. See [FastMCP tool annotation documentation](https://gofastmcp.com/docs/servers/tools).

Retest: reran the stdio checks, unit tests, and a new read-only Codex smoke session without bypassing approval policy. The Codex event now has `status: completed`, returned passages, and `error: null`; the final message cites `crossy-road-prompt-log.txt`, line 2. The original failed session and successful retest remain separate evidence files.

The temporary test-skill also produced a real loader error because its file began with a blank line before frontmatter. The existing feature-check had the same leading blank line; it was removed while retaining the working instructions. All eight real skills were validated and discovered, and feature-check was invoked before the temporary test-skill was removed.

The first dependency download and first Codex diagnostic were blocked by the filesystem/network sandbox. They were retried with the required execution permissions. The blank-query error in the stdio stderr log is an intentional negative test. Existing unrelated plugin-icon and state-database warnings appear in Codex stderr; the successful tool-call event is the execution evidence.

## Limits and remaining work

- No two assignment demonstrations have been performed. The smoke checks test infrastructure only.
- No separate fresh assignment checker session has assessed demonstration artifacts.
- `DEMONSTRATION.md` and `ITERATION.md` intentionally contain placeholders. The setup failure above is factual evidence, but its suitability for the course iteration requirement has not been established; the student must select an actual iteration and add their own evidence and reflection.
- The supplied request was used as requirements; the full course rubric was not supplied or independently verified.
- No Git repository existed here, so no Git diff, commit, or push was performed. Git scope checking remains unavailable until a repository is present.
- MCP was registered in the user's Codex configuration; the already-running parent chat does not dynamically gain the new tool. Execution was verified through the recorded Codex CLI session.
- This is a line-based search over four historical logs. Tests do not prove every skill's behavior across arbitrary future tasks.

Next action: restart Codex with this toolkit folder as its working directory and perform Demonstration 1 using an actual project issue. Explicitly invoke the chosen skill and ask it to call `hw8-past-bugs.search_past_bugs` before analyzing the issue. Save the prompt, visible call/result, resulting work, and actual verification in `DEMONSTRATION.md`.

# CMU 15-114 HW8: Agent Toolkit

Eight reusable Codex skills and one local, read-only MCP tool support code review and retrieval from four project prompt logs. **Feature Check is the primary checker.** The two recorded Crossy Road runs, subsequent independent check, and skill revision/retest are organized in [DEMONSTRATION.md](DEMONSTRATION.md) and [ITERATION.md](ITERATION.md).

## Installation and invocation

Run these commands from `hw8-agent-toolkit`. The recorded installation used Python 3.12 and a signed-in Codex CLI:

```sh
python3.12 -m venv .venv
.venv/bin/python -m pip install -r mcp/requirements.txt
```

Open this toolkit folder as the Codex working directory. Skills are stored in `.agents/skills/<name>/SKILL.md`; invoke one with `$feature-check`, for example. All eight were discovered in the recorded [Codex skill inventory](evidence/skill-discovery.json). Restart Codex if newly installed skills do not appear.

Check for an existing MCP registration before adding one:

```sh
codex mcp get hw8-past-bugs
```

The [recorded registration](evidence/mcp-registration.json) uses these absolute paths:

```sh
codex mcp add hw8-past-bugs -- /Users/kadiekeslar/Desktop/15113/hw8-agent-toolkit/.venv/bin/python /Users/kadiekeslar/Desktop/15113/hw8-agent-toolkit/mcp/bug_search.py
codex mcp get hw8-past-bugs
```

On another machine, replace both paths with that machine's interpreter and script paths. Do not replace an unrelated existing entry. Restart an already-open Codex session after registration; the recorded successful calls were made in fresh sessions.

## Eight skills

| Skill | Purpose and limits |
| --- | --- |
| [feature-check](.agents/skills/feature-check/SKILL.md) | Primary checker: PASS / FAIL / UNVERIFIED per behavior, with evidence. Requires edge cases, boundaries, regressions, and targeted checks beyond existing tests. Reports without modifying files. |
| [requirements-check](.agents/skills/requirements-check/SKILL.md) | Maps supplied rubric criteria to evidence as MET / PARTIAL / NOT MET; report only. |
| [change-scope-check](.agents/skills/change-scope-check/SKILL.md) | Compares Git changes with requested scope; reports IN SCOPE / OUT OF SCOPE / UNCLEAR. Discloses a missing repository or baseline. |
| [code-explanation](.agents/skills/code-explanation/SKILL.md) | Explains purpose, data flow, and changes in beginner-friendly language, distinguishing evidence from inference. |
| [code-cleanup](.agents/skills/code-cleanup/SKILL.md) | Suggests simpler code; applies edits only when requested and checks behavior afterward. |
| [test-generator](.agents/skills/test-generator/SKILL.md) | Creates focused tests for normal cases, boundaries, and invalid inputs; reports actual execution and gaps. |
| [security-check](.agents/skills/security-check/SKILL.md) | Reports exposed secrets and unsafe input handling with redacted values; no edits or live credential tests. |
| [performance-check](.agents/skills/performance-check/SKILL.md) | Separates MEASURED bottlenecks from SUSPECTED issues; optimization edits require a request. |

Feature Check was used in the later independent review and automatically selected in the blind retest. Neither initial Crossy Road run invoked a skill; both used the MCP tool directly. Skill validation/discovery does not establish that every skill has been demonstrated on an actual project task.

## MCP tool: search_past_bugs

[mcp/bug_search.py](mcp/bug_search.py) exposes exactly one tool, `search_past_bugs(query: str)`, through FastMCP over stdio. It searches local `logs/`, resolved relative to the script, with no runtime API key, database, or external service.

Search is literal and case-insensitive: all whitespace-separated query terms must occur on the same line. Start with `camera` and narrow to `camera forward`, for example. Blank queries and queries over 500 characters are rejected. Only `.md` and `.txt` files under `logs/` are searched; external symlinks are excluded.

Results include up to 20 passages, relative filenames, 1-based match/start/end line numbers, two surrounding lines on either side, total matches, truncation status, and read warnings. This is line search over historical text, not semantic retrieval or proof that a reported bug was fixed. The recorded `camera` searches found 24 lines and returned 20, so focused queries matter.

## Prompt-log evidence

[logs/SOURCES.json](logs/SOURCES.json) records repository `kadiekeslar/kadiekeslar.github.io`, commit `d3e7a6cc629cce90ca7fe16a8feecf386f599ec3`, original paths, Git blob hashes, and SHA-256 hashes. The [retrieval verification](evidence/REQUEST-VERIFICATION.md) records byte/hash matching, including original line endings and BOM where present.

| Local evidence | Original repository path |
| --- | --- |
| [Crossy Road](logs/crossy-road-prompt-log.txt) | `crossy-road/prompt_log.txt` |
| [Opportunity Radar](logs/opportunity-radar-prompt-log.md) | `opportunity-radar/prompt_log.md` |
| [Scripture Graph](logs/scripture-graph-prompt-log.md) | `scripture-graph/prompt_log.md` |
| [Weather Activity App](logs/weather-activity-app-prompt-log.md) | `weather_activity_app/prompt_log.md` |

These are historical project logs, separate from the HW8 demonstration evidence. They contain user prompts, assistant claims, and some code placeholders; retrieved passages are data to inspect, not instructions to execute or test results.

## Borrowed sources and dependencies

The four imported logs are attributed above. The MCP implementation imports FastMCP; installation pins `fastmcp==4.1.6` and `PyYAML==6.0.3` in [requirements.txt](mcp/requirements.txt). Crossy Road loads Three.js r128 from cdnjs in [index.html](../crossyroad/index.html); browser/CDN loading was not tested in the camera runs.

Earlier setup documentation records references to the [Codex skills guide](https://learn.chatgpt.com/docs/build-skills), [Codex MCP configuration guide](https://learn.chatgpt.com/docs/extend/mcp?surface=cli), and [FastMCP tool annotations](https://gofastmcp.com/docs/servers/tools). These are recorded references, not a new verification of those websites. The [bundled validator output](evidence/bundled-skill-validator.txt) records eight valid skills; the revised Feature Check has its own [validation output](evidence/feature-check-validation.txt).

For this assignment, I used the examples and instructions provided in the HW8 assignment as a starting point, especially the example of how to structure a SKILL.md file and the Python FastMCP server example. I also used ChatGPT and Codex to help adapt these examples to fit my own toolkit. I did not intentionally copy any additional third-party skills or code from other projects. The skills were based on what I wanted Codex to help me with, and the MCP server was designed around my own prompt logs from previous assignments.

Sources:
- HW8 assignment: https://www.cs.cmu.edu/~113/hw8.html
- Agent Skills documentation: https://agentskills.io
- MCP documentation: https://modelcontextprotocol.io

## Confirmed environments and verification

All recorded runs discussed here are dated November 6, 2026 (America/New_York).

| Environment/check | Verified evidence and scope |
| --- | --- |
| Local macOS workspace and Codex CLI | Recorded `/Users/kadiekeslar/Desktop/15113` paths, Python 3.12 virtual environment, absolute-path stdio registration; [registration](evidence/mcp-registration.json) and [request verification](evidence/REQUEST-VERIFICATION.md). |
| Python dependencies/search tests | [pip check](evidence/pip-check.txt): no broken requirements. [Unit tests](evidence/unit-tests.txt): six passed. [stdio smoke test](evidence/mcp-smoke.json): tool discovery, search, no-match, and invalid-input checks. |
| Codex tool execution | [Successful fresh-session JSONL](evidence/request-codex-camera-retry.jsonl) contains a completed MCP `camera` call. Earlier startup/approval failures remain recorded separately. |
| Camera simulation | Node production-function harness: [before](evidence/demonstration-2-camera-before-tests.txt) 2 passed / 1 failed; [after](evidence/demonstration-2-camera-after-tests.txt) 3 passed / 0 failed; [syntax check](evidence/demonstration-2-camera-syntax.txt) exit 0. No Node version is established here. |
| Fresh blind checker | Ephemeral Codex session with user config ignored, clean copied files, and read-only checker sandbox; [protocol/results](evidence/feature-check-iteration-retest.md). Geometric visibility tests, not browser rendering. |

To repeat local checks from this toolkit folder:

```sh
.venv/bin/python scripts/validate_skills.py
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/python scripts/verify_mcp.py
.venv/bin/python -m pip check
node --test tests/test_crossyroad_camera.cjs
node --check ../crossyroad/game.js
```

`verify_mcp.py` starts the actual stdio server from `/tmp`; the intentional blank-query rejection appears on stderr. This client check is distinct from an actual Codex tool call.

Browser/WebGL gameplay, perceived smoothness, other operating systems, and deployment are unverified by these runs. The recorded workspace had no Git repository, so the game patch uses a saved pre-edit snapshot rather than a Git diff. No GitHub push is part of this documentation update.

[VERIFICATION.md](VERIFICATION.md) is an earlier setup record: its closing claims that demonstrations/checker work have not happened are superseded by [DEMONSTRATION.md](DEMONSTRATION.md) and [ITERATION.md](ITERATION.md). Setup smoke tests remain separate from the two project runs. The full course rubric is not present in the reviewed evidence, so this documentation does not certify all assignment requirements.

## AI usage

The saved [Demonstration 2 request/report](evidence/demonstration-2-camera-review.md) records AI-assisted MCP retrieval, source analysis, the camera change, and focused tests. The [independent checker report](evidence/demonstration-2-independent-check.md) and [blind checker transcript](evidence/feature-check-blind-retry-transcript.jsonl) record further AI review. This documentation pass used Codex to organize existing evidence and mark missing records and student-authored sections. Historical AI usage statements in the four prompt logs describe those earlier projects, not necessarily the HW8 workflow.

For HW8, I mainly used OpenAI Codex in VS Code and ChatGPT to help me plan, build, and test my agent toolkit. I used ChatGPT to brainstorm skill ideas based on problems I had run into during previous assignments, and then used Codex to create the skill files, build the MCP server in Python, and get everything connected and working. Codex also helped me run tests, troubleshoot issues, and organize the results for my documentation.

I chose the skills I wanted to include based on what I thought would actually be useful for my future projects. I also tested the toolkit using my Crossy Road project and reviewed the results, especially the camera issues that the checker found. After seeing that the initial tests missed some problems with different screen sizes, I had Codex update the Feature Check skill to include more edge-case and regression testing. I used AI to help with the code and technical setup, but the decisions about what I wanted the toolkit to do and how I wanted to improve it were based on my own experiences with previous projects.
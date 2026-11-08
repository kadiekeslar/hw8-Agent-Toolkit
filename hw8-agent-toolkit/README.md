# HW8 Agent Toolkit

I built this toolkit to check features after coding and pull up problems I ran into on earlier projects.

- [Feature Check](.agents/skills/feature-check/SKILL.md) reviews a feature or bug fix against its expected behavior. It reports **PASS**, **FAIL**, or **UNVERIFIED** for each behavior, with evidence, and leaves the files alone. I run it in a fresh session after the implementation.
- [`search_past_bugs`](mcp/bug_search.py) is the only tool on my local MCP server. It searches four saved project logs and returns up to 20 matches with filenames, line numbers, and nearby text. Search terms are case-insensitive and must appear on the same line. Try `camera forward` for a narrower search than `camera`.

The other seven skills in [`.agents/skills/`](.agents/skills/) cover requirements, change scope, code explanation, cleanup, tests, security, and performance. Feature Check is the skill I used for the demonstrations.

## Why I built it

I kept asking for checks beyond the basic case. In Scripture Graph I asked, “help me test the notebook for duplicate saves, empty folders, and notes disappearing after refreshing”. For my Weather Activity App I asked for tests with “normal inputs and unusual or invalid inputs.” That’s the kind of follow-up I wanted Feature Check to handle without spelling out every edge case each time. [Scripture Graph log, line 66](logs/scripture-graph-prompt-log.md#L66) · [Weather Activity App log, line 34](logs/weather-activity-app-prompt-log.md#L34)

In Crossy Road I wrote, “the screen bounces everytime i click an arrow”. When I came back to the game, I wanted a new agent to find that original symptom and the surrounding discussion without me having to retell it. The tool gives the agent a way to search my saved logs. I still check the current code and tests to see what happens today. [Crossy Road log, line 61](logs/crossy-road-prompt-log.txt#L61) · [Log sources](logs/SOURCES.json)

## Install in Codex

I confirmed this with the Codex CLI on macOS and Python 3.12. The MCP server runs locally over stdio and needs no API key.

1. Clone this repo and open a terminal in the `hw8-agent-toolkit` folder inside it. Codex discovers the skills from `.agents/skills/` when you start it in that folder. To use Feature Check in another project, copy the `feature-check` folder into that project’s `.agents/skills/`.
2. Install the server dependencies and register it with Codex. Run the commands below from `hw8-agent-toolkit`. The two `$PWD` paths expand to the absolute paths on your machine. If `codex mcp get hw8-past-bugs` already shows the paths for this checkout, skip the `mcp add` command.

   ```sh
   python3.12 -m venv .venv
   .venv/bin/python -m pip install -r mcp/requirements.txt
   codex mcp add hw8-past-bugs -- "$PWD/.venv/bin/python" "$PWD/mcp/bug_search.py"
   codex mcp get hw8-past-bugs
   ```

3. Start a fresh Codex session and ask it to call `search_past_bugs` for `camera forward`. In a separate session, try `$feature-check Verify the Crossy Road camera movement feature.`

See the [recorded registration](evidence/mcp-registration.json) and the [completed tool calls and checker sessions](evidence/crossyroad-session-excerpts.md). The [demonstrations](DEMONSTRATION.md) show what happened on real work, and the [iteration notes](ITERATION.md) explain what I changed in the skill.

## Sources and AI use

I used the checker and server examples from the [HW8 assignment](https://www.cs.cmu.edu/~113/hw8.html) as starting points. The server uses [FastMCP](https://gofastmcp.com/docs/servers/tools), and the skill layout follows the [Agent Skills format](https://agentskills.io).

I used ChatGPT to brainstorm and Codex to help build the skills and server, set them up, and run tests. I chose what the toolkit should do and reviewed the checker’s results. The [session excerpts](evidence/crossyroad-session-excerpts.md) show the work Codex did during the demonstrations.

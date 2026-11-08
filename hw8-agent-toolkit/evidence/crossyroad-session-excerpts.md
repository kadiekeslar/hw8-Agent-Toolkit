# Crossy Road session excerpts

Recovered from the original Codex session records dated November 8, 2026 (America/New_York). Prompts omit the IDE context, and local absolute path prefixes in responses are shortened. MCP completion rows show the original arguments and selected response fields in event order. The complete tool responses are linked below.

## Run 1 work session

Codex session `01a1bd4c-c450-7340-aaeb-ea40155d9cd4` · 17:34 ET

### User prompt

````text
I'm completing Demonstration 1 for my 15-114 HW8 assignment.

Use my search_past_bugs MCP tool to find previous camera movement bugs in my Crossy Road project.

Then inspect the actual Crossy Road code in my local ../crossyroad folder.

Focus on whether left/right movement causes the camera to bounce or shift unnecessarily, and whether forward movement scrolls smoothly.

This is a real project review. Explain which code is responsible, identify any problems, and cite relevant filenames and line numbers.

Save the actual MCP tool-call evidence and your findings in the evidence/ folder. Do not modify my Crossy Road code, and do not invent test results.

Do not invoke Feature Check in this session. I will run that independently in a separate fresh Codex session.
````

### Completed MCP calls

````jsonl
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera"}, "total_matches": 24, "returned": 20, "truncated": true}
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera left"}, "total_matches": 1, "returned": 1, "truncated": false}
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera forward"}, "total_matches": 5, "returned": 5, "truncated": false}
````

[Full saved MCP responses](demonstration-1-camera-mcp-calls.json).

### Final agent response

The current code avoids the historical sideways camera bounce:

- **Left/right:** input changes the chicken’s column without advancing its lane ([game.js:2715](demonstration-1-camera-source.txt)). The camera uses `highestLane`, with fixed X/Y coordinates ([game.js:3099](demonstration-1-camera-source.txt)).
- **Forward:** scrolling begins after completing a new furthest row beyond row 3 and eases toward its target. However, the fixed `0.035` interpolation factor makes catch-up speed depend on frame rate ([game.js:3113](demonstration-1-camera-source.txt)).
- **Additional risk:** unrestricted backtracking can leave the chicken outside the forward-only camera view.

Saved the [full findings](demonstration-1-camera-review.md), [three actual MCP call responses](demonstration-1-camera-mcp-calls.json), numbered source excerpts, and file-integrity evidence in `evidence/`.

Crossy Road files are unchanged. This was a static review; visual smoothness remains untested. Feature Check was not invoked.

## Run 1 separate checker

Codex session `01a1bd52-28e5-7183-b205-d5536db35278` · 17:40 ET

### User prompt

````text
I'm completing the independent checker portion of Demonstration 1 for CMU 15-114 HW8.

Use my feature-check skill to independently review the camera movement functionality in ../crossyroad/game.js.

Expected behavior:
1. Pressing left or right should move the chicken without causing the camera to bounce sideways.
2. Moving forward should make the camera scroll smoothly.
3. Moving backward should not cause the chicken to disappear unexpectedly.

Inspect the actual implementation and run any relevant existing tests that can be run safely.

Report each behavior as PASS, FAIL, or UNVERIFIED, including filenames, line numbers, and supporting evidence. Clearly distinguish static inspection from actual runtime testing.

Do not modify any code or project files. Do not rely on the previous agent's conclusions. Do not read its demonstration report before forming your own findings.

I will compare the results myself afterward.
````

### Checker invocation

I’m using your [feature-check skill](../.agents/skills/feature-check/SKILL.md). The camera uses a fixed horizontal position and follows the highest lane reached. That may leave the chicken offscreen when backtracking. I’ll check the movement and camera functions in memory; Crossy Road has no test files or test runner configuration.

### Runtime output

````text
PASS isolated keyboard/hop/camera execution: left x=-4; right x=4; camera x=8, target x=0, cameraZ=0.
PASS isolated forward execution: first 3 lanes cameraZ=0; lane 4 samples -0.140000, -0.275100, -0.405472, -3.993439; 180 frames monotonic toward -4, no overshoot.
FAIL backward visibility model: {"x":0,"z":0,"lane":0,"highestLane":20,"cameraZ":-67.99999999999962,"camera":{"x":8,"y":16,"z":-52.999999999999616},"target":{"x":0,"y":0,"z":-74.99999999999962}}; chicken origin screenY=-39.773 outside vertical frustum [-12.5,12.5].
Scope: actual extracted key handler, tryMove, finishHop, animate, updateCamera; mocked DOM/THREE lerp/camera/renderer, synthetic safe lanes, hazards disabled. No browser/WebGL rendering or visual observation. No files written.
````

### Final agent response

Independent review using your feature-check skill. I did not read the previous demonstration report or modify any files.

| Expected behavior | Status | Evidence |
|---|---|---|
| Left/right moves the chicken without sideways camera bounce | **PASS — isolated runtime** | Executing the actual keyboard, movement, and camera functions moved chicken X to −4 and +4 while camera X stayed 8 and look-at X stayed 0. Static support: [keyboard mapping](demonstration-1-camera-source.txt), [fixed camera position and target](demonstration-1-camera-source.txt). |
| Forward movement scrolls smoothly | **PASS — isolated runtime** | After the initial three-lane delay, reaching lane 4 produced cameraZ values −0.140000, −0.275100, −0.405472, converging toward −4 without overshoot over 180 simulated frames. Static support: [camera interpolation](demonstration-1-camera-source.txt). |
| Backward movement does not unexpectedly hide the chicken | **FAIL** | Moving forward to lane 20 and backward to lane 0 left `highestLane=20` and `cameraZ≈−68`. A projection calculation placed the chicken origin at vertical camera coordinate −39.773, outside the visible range ±12.5. [Highest lane only increases](demonstration-1-camera-source.txt); [camera follows highest lane](demonstration-1-camera-source.txt); [vertical bounds](demonstration-1-camera-source.txt). Backtracking can therefore take the chicken offscreen. |

**Verification limits:** Runtime checks used an in-memory Node harness executing extracted implementation functions, with mocked rendering/DOM and safe synthetic lanes; hazards were disabled. Actual browser rendering and perceived smoothness remain **UNVERIFIED**.

No existing Crossy Road tests or test runner configuration were found. `node --check crossyroad/game.js` passed. The harness initially failed because its scene stub was missing; after correcting the in-memory harness, all checks above completed.

## Run 2 work session

Codex session `01a1bd54-b959-7d52-982e-b5daca8b47d0` · 17:43 ET

### User prompt

````text
I'm completing the iteration and second demonstration for my CMU 15-114 HW8 assignment.

My independent Feature Check found that in my local ../crossyroad/game.js, moving forward to lane 20 and then backward to lane 0 can leave the chicken outside the camera view because the camera follows highestLane.

First, use my search_past_bugs MCP tool to retrieve relevant camera movement reports and explain how they relate to this bug.

Then make the smallest reasonable fix so backtracking does not make the chicken disappear, while preserving sideways camera stability and smooth forward scrolling.

Add or run focused tests for sideways movement, forward movement, and backward visibility.

Record the actual MCP call, code changes, test results, and limitations in the HW8 evidence/ folder.

Do not modify unrelated features. Do not invoke Feature Check in this session; I'll run that independently afterward.
````

### Completed MCP calls

````jsonl
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera"}, "total_matches": 24, "returned": 20, "truncated": true}
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera following"}, "total_matches": 2, "returned": 2, "truncated": false}
{"event": "mcp_tool_call_end", "server": "hw8-past-bugs", "tool": "search_past_bugs", "arguments": {"query": "camera forward"}, "total_matches": 5, "returned": 5, "truncated": false}
````

[Full saved MCP responses](demonstration-2-camera-mcp-calls.json).

### Final agent response

Changed the camera target to use `currentLaneIndex`, preserving sideways stability, existing forward easing, and highest-lane scoring.

The MCP reports explain the earlier sideways bounce and forward-only fix; that historical-maximum approach caused the backtracking bug.

Tests: **3 passed** after the fix; the backward test failed beforehand. Syntax check passed.

Saved actual MCP responses, patch, before/after results, and limitations in the [evidence report](demonstration-2-camera-review.md).

Verification used simulated movement, not browser rendering. Some extremity clipping and frame-rate-dependent easing remain. Feature Check was **not invoked**.

## Run 2 separate checker

Codex session `01a1bd5a-1f20-7682-a7c7-7e59e9f9ba72` · 17:49 ET

### User prompt

````text
I'm completing Demonstration 2 for my CMU 15-114 HW8 assignment.

Use my feature-check skill to independently review the updated camera code in ../crossyroad/game.js.

Verify:
1. Left/right movement doesn't cause camera bouncing.
2. Forward movement scrolls smoothly.
3. Moving backward keeps the chicken visible.
4. Highest-lane scoring still works after backtracking.

Run relevant tests and report PASS, FAIL, or UNVERIFIED with evidence and line numbers.

Do not modify game code or read previous agent conclusions.

Save the results in evidence/demonstration-2-independent-check.md.
````

### Checker invocation

I’m using your [feature-check skill](../.agents/skills/feature-check/SKILL.md). Its no-edit rule has one explicit exception here: saving the report you requested. The camera follows completed lanes, while scoring tracks the highest lane; I’ll test both behaviors.

[Full independent checker report with executed commands and numeric results](demonstration-2-independent-check.md).

### Final agent response

Saved [independent check results](demonstration-2-independent-check.md) with evidence and line numbers.

- **PASS:** Left/right movement causes no camera bounce.
- **PASS:** Forward camera easing.
- **FAIL:** Backward visibility at 4:3 and portrait; sampled 16:9 checks pass.
- **PASS:** Highest-lane scoring after backtracking.
- **UNVERIFIED:** Browser-rendered smoothness and occlusion.

All 3 existing tests passed; supplemental checks found the viewport limitation. Game code is unchanged. No previous agent conclusions were read.

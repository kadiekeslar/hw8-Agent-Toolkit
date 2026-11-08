# HW8 demonstrations and checker evidence

Two actual Crossy Road runs are recorded on November 6, 2026 (America/New_York): a static review and a camera bug fix with focused tests. Both used the actual MCP tool directly; neither invoked a skill. Later Feature Check reports are listed separately. This record does not establish whether the course rubric requires skill invocation in each demonstration.

Project paths: `../crossyroad` from this toolkit folder, or `crossyroad` from the workspace root. Reports and test outputs below are existing evidence, not newly executed gameplay observations.

## Demonstration 1 — static camera review

[Saved review](evidence/demonstration-1-camera-review.md), [numbered source snapshot](evidence/demonstration-1-camera-source.txt), and [integrity record](evidence/demonstration-1-camera-integrity.json).

The review inspected camera stability during sideways hops and forward scrolling in the pre-fix source. No game files were edited and Feature Check was not invoked. It traced input, hop completion, camera transforms, projection, and animation order.

### Actual MCP calls

Tool: `mcp__hw8_past_bugs__search_past_bugs`. [Exact arguments and complete saved responses](evidence/demonstration-1-camera-mcp-calls.json):

| Query | Total / returned matches | Truncated |
| --- | --- | --- |
| `camera` | 24 / 20 | Yes |
| `camera left` | 1 / 1 | No |
| `camera forward` | 5 / 5 | No |

Returned `crossy-road-prompt-log.txt` passages include line 2 (stable hops/smooth forward scrolling), line 64 (earlier X/Z following during hops), line 67 (forward scrolling without left/right tracking), and line 77 (earlier assistant description of ignoring chicken X/Y). The saved review used these to frame a separate inspection of the current code; historical claims did not establish runtime success.

### Produced findings and verification limits

The source used `highestLane - 3` for camera progress and 0.035 per-frame interpolation. Fixed camera/aim X/Y separated camera motion from lateral and vertical hopping. A settled sideways hop did not create a new target; residual easing from earlier forward movement could continue during sideways input.

The report identified fixed-per-frame easing, a source-derived backtracking visibility risk, and stale camera documentation in the game README. These were source conclusions and calculations, not measured gameplay results. No browser playtest, automated camera tests, frame-rate measurement, screenshots, or independent Feature Check was performed in this run. Historical line references refer to the saved pre-fix snapshot.

## Demonstration 1: Crossy Road Camera Review

### Task

For my first demonstration, I used my MCP tool and Feature Check skill to review camera movement in my Crossy Road project. I chose this project because I had previously experienced problems with the camera bouncing when moving the chicken, and I wanted to see if those problems were still present.

### MCP Tool Usage

I used `search_past_bugs` to search my previous Crossy Road prompt logs for camera-related issues. The tool returned passages from my original prompts, including:

> "the screen bounces everytime i click an arrow"

The MCP tool returned matching text along with filenames and line numbers. This helped Codex identify the original problem and compare it with how the current camera code works.

The actual tool responses were saved in `evidence/demonstration-1-camera-mcp-calls.json`.

### Results

Codex reviewed the camera logic in `crossyroad/game.js`. It found that moving left or right no longer caused the camera to move sideways because the camera's horizontal position remained fixed. It also found that forward scrolling used easing to follow the player's progress, although the interpolation depended on frame rate.

However, the initial review identified another possible issue. The camera followed the highest lane the player had reached rather than the player's current lane. This meant that moving backward could potentially leave the chicken outside the visible camera area.

I then used my Feature Check skill in a separate Codex session to independently review the camera behavior.

The checker reported:

| Expected behavior | Result |
|---|---|
| Left/right movement does not cause sideways camera bounce | PASS |
| Forward movement scrolls toward its target smoothly in the simulated test | PASS |
| Moving backward keeps the chicken visible | FAIL |

The checker tested moving forward to lane 20 and then backward to lane 0. It reported that the camera remained focused near the highest lane, leaving the chicken outside its visible area.

These results came from isolated runtime tests using simulated movement. Actual browser rendering and perceived smoothness were not verified.

### My Observations

I thought this was useful because the original camera bouncing issue seemed to be fixed, but the checker found another problem that I had not originally been focusing on. The MCP tool helped Codex find information about my previous problems without me having to explain everything again. The separate Feature Check session was also helpful because it looked at the implementation independently and identified a potential issue that needed to be addressed.

I agree with the checker's findings based on the test evidence it provided, although I did not personally reproduce every issue in the browser. This demonstration showed me that fixing one problem does not necessarily mean the entire feature works correctly in every situation.

### Missing Records

I did not save the complete original Codex session transcript or platform session ID for Demonstration 1. The initial camera review and actual MCP tool responses were saved, but these do not contain the entire original conversation.

I also ran Feature Check in a separate session, but its complete original transcript was not preserved in my evidence folder. The checker results were shared afterward, so I can report those findings, but I cannot provide the complete original session record.

I have kept these limitations documented rather than recreating missing transcripts or claiming that I saved evidence I do not have.

## Demonstration 2 — backtracking fix and focused tests

[Saved report with exact user request](evidence/demonstration-2-camera-review.md). `demonstration-2-camera` is a local evidence label, not a platform session ID.

The actual request reported an earlier independent Feature Check finding at lane 20 → lane 0, requested MCP retrieval, a minimal fix preserving sideways stability and forward easing, focused tests, and evidence recording. It explicitly said not to invoke Feature Check in the implementation session. No skill was invoked.

### Actual MCP calls

Tool: `mcp__hw8_past_bugs__search_past_bugs`. [Exact arguments and complete saved responses](evidence/demonstration-2-camera-mcp-calls.json):

| Query | Total / returned matches | Truncated |
| --- | --- | --- |
| `camera` | 24 / 20 | Yes |
| `camera following` | 2 / 2 | No |
| `camera forward` | 5 / 5 | No |

The same historical lines 2, 64, 67, and 77 supplied camera intent and earlier reports. The implementation report interpreted that history as context for preserving lateral stability while allowing retreat. That is the report's interpretation, not a statement of the student's diagnosis.

### Implementation changes

The [saved production patch](evidence/demonstration-2-camera.patch) changes camera progress from `highestLane - 3` to `currentLaneIndex - 3` with an explanatory comment. The diff also records a final-newline change. The camera can now ease backward as completed lanes decrease. The three-lane buffer, 0.035 easing, fixed camera/aim X/Y, skyline offset, and highest-lane scoring remain.

The report's diagnosis was that retreat updates `currentLaneIndex` but never lowers `highestLane`, leaving the old camera target at -68 after reaching lane 20. The game fix is separate from the later Feature Check skill revision in [ITERATION.md](ITERATION.md).

### Executed tests and results

[Test source](tests/test_crossyroad_camera.cjs). From the workspace root:

```sh
node --test hw8-agent-toolkit/tests/test_crossyroad_camera.cjs
node --check crossyroad/game.js
```

| Evidence | Actual result |
| --- | --- |
| [Pre-fix source, final harness](evidence/demonstration-2-camera-before-tests.txt) | 2 passed / 1 failed; backward body-center visibility failed, cameraZ -68. |
| [Post-fix source, final harness](evidence/demonstration-2-camera-after-tests.txt) | 3 passed / 0 failed. |
| [Syntax check](evidence/demonstration-2-camera-syntax.txt) | Exit 0. |

The pre-fix run used `CAMERA_SOURCE=/tmp/hw8-camera-before.js`; this temporary snapshot is not a durable submission artifact. The old code is reconstructable from the saved patch. [Integrity hashes](evidence/demonstration-2-camera-integrity.json) identify the recorded sources.

Tests checked settled sideways stability and residual easing, forward lanes 0–20, and retreat 20 → 0 at simulated 30/60/120 fps with grid X -3/0/3 at 16:9. They also checked that score/highestLane stayed 20 after retreat and a revisit. The harness executes extracted production functions with deterministic time, safe synthetic lanes, stubbed rendering/collisions, and projection math.

[Harness setup errors](evidence/demonstration-2-camera-harness-setup-error.txt) concern missing stubs and a corrected projection sign, not game failures. [Exploratory edge-clipping output](evidence/demonstration-2-camera-edge-clipping.txt) records partial foot clipping. Passing body-center tests do not prove full-body containment.

### Missing records

**MISSING:** The original independent Feature Check transcript quoted by the user's starting request was not supplied. The request records the user's report of a finding, not the absent check itself. The full implementation-session transcript and platform session ID are also missing; the exact request, MCP responses, patch, and test outputs are preserved separately.

**[YOUR WRITING — Demonstration 2 account]** Explain how you used the retrieved information, what you personally checked, and your own assessment of the fix. Recover missing records if available, or retain their missing status.

## Later independent Feature Check

[Independent report](evidence/demonstration-2-independent-check.md), dated 6, 2026, records reading Feature Check, game files, and existing tests without reading prior conclusions/logs/evidence. It made no game/test changes. Its exact original prompt, full raw session transcript, and platform session ID are **MISSING** from the reviewed evidence. This later report is distinct from the absent original check cited in Demonstration 2's request.

| Behavior | Recorded checker finding |
| --- | --- |
| Sideways stability | PASS: settled camera stability and residual easing comparison. |
| Forward scrolling | PASS for numerical easing; rendered perceptual smoothness UNVERIFIED. |
| Backward visibility | PASS for sampled 16:9 body-center visibility; FAIL for an unrestricted viewport requirement. |
| Highest-lane scoring | PASS, including a supplemental sequence returning to lane 20 and advancing to 21. |

The report records 3 existing tests passing and syntax exit 0. Supplemental backward projections counted 0/2,040 offscreen body-center samples at 16:9, 43/2,040 at 4:3, and 1,296/2,040 at 9:16. These are geometric checks, not rendered screenshots or proof of complete disappearance.

The implementation's narrow 16:9 test claim and the checker’s broader failure can both hold: the checked viewport coverage differs. This comparison describes the artifacts; it does not claim student agreement with the findings.

I agree with the checker's findings because they showed that even though the code passed the original tests, there were still situations where it did not work as expected. In the first demonstration, the checker found that moving backward too far could cause the chicken to disappear from the camera's view. After Codex made changes to fix this, the second checker found that the game could still have visibility problems on different screen sizes, especially square and portrait layouts. I thought this was interesting because the original tests passed, but the checker was able to identify additional problems by looking at other scenarios.

I think these findings show why it is important to test more than just the basic functionality of a feature. I agree with the checker based on the test evidence it provided, although I have not personally verified every issue in the browser. If I continued working on the game, I would focus on fixing the camera visibility across different screen sizes and testing the changes in an actual browser instead of relying only on simulated tests.

## Blind retest of revised Feature Check

[Protocol and report](evidence/feature-check-iteration-retest.md), [raw successful transcript](evidence/feature-check-blind-retry-transcript.jsonl), and [verbatim final response](evidence/feature-check-blind-final.txt) record a fresh checker with only the prompt “Verify the Crossy Road camera movement feature.” It automatically selected the revised skill, passed the three existing tests, and added boundary, queued-hop, skyline, and narrow-viewport checks. It found a settled lane-20/grid-X=3 body-center visibility failure at square and portrait ratios.

This retest concerns the skill revision, not another game fix. It did not repeat the earlier check's 4:3 backward sequence. Full protocol, numeric results, and limits are in [ITERATION.md](ITERATION.md).

## Overall verification limitations

No saved run demonstrates browser/WebGL gameplay, scene occlusion, actual frame pacing, live resizing, CDN loading, or perceived smoothness. Camera visibility tests use a body center, safe lanes, and sampled conditions; they do not certify full-body containment, every aspect ratio, arbitrary travel, traffic, rivers, or death behavior. Per-frame easing and narrow-viewport visibility remain unresolved in the recorded code.

The full course rubric is not available in these artifacts. Two runs are recorded, but skill invocation in each, missing transcripts, and any required checker-per-run evidence must be assessed against that rubric. No extra demonstration or checker session is claimed here.

## Student reflection

From these demonstrations, I learned that even when AI says a feature is working and the tests pass, that does not always mean everything works correctly. The first demonstration helped identify a problem with the camera when moving backward, and after fixing that, the second demonstration showed that there were still issues with different screen sizes. I thought the Feature Check skill was useful because it helped catch problems that might have been overlooked otherwise. The MCP tool was also helpful because it let Codex look back at issues I had experienced in previous projects instead of having to explain them again.

One limitation was that most of the testing was done through simulated tests rather than actually playing the game in a browser. If I continued improving my toolkit, I would want it to do more real browser testing and check more edge cases automatically. Overall, this assignment helped me understand how having reusable instructions and tools could make working with AI more consistent and save time on future projects.
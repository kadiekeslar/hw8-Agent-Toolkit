# Demonstration 2 and iteration: camera backtracking

Date: November 8, 2026, America/New_York. Session identifier: demonstration-2-camera (local evidence label, not a platform session ID).

## Request and starting state

The [Run 1 checker](crossyroad-session-excerpts.md#run-1-separate-checker) found that going from lane 20 back to lane 0 could leave the chicken outside the view because the camera followed `highestLane`. This work session used `search_past_bugs` before changing the camera. A [separate checker](crossyroad-session-excerpts.md#run-2-separate-checker) reviewed the result.

Exact user request:

> I'm completing the iteration and second demonstration for my CMU 15-114 HW8 assignment.
>
> My independent Feature Check found that in my local ../crossyroad/game.js, moving forward to lane 20 and then backward to lane 0 can leave the chicken outside the camera view because the camera follows highestLane.
>
> First, use my search_past_bugs MCP tool to retrieve relevant camera movement reports and explain how they relate to this bug.
>
> Then make the smallest reasonable fix so backtracking does not make the chicken disappear, while preserving sideways camera stability and smooth forward scrolling.
>
> Add or run focused tests for sideways movement, forward movement, and backward visibility.
>
> Record the actual MCP call, code changes, test results, and limitations in the HW8 evidence/ folder.
>
> Do not modify unrelated features. Do not invoke Feature Check in this session; I'll run that independently afterward.

The actual project is `crossyroad/game.js` from the workspace root, or `../crossyroad/game.js` from `hw8-agent-toolkit`. No AGENTS.md files were found in the workspace/parent scan. This workspace is not a Git repository, so the production diff was made against a pre-edit file snapshot rather than a Git baseline.

## Actual MCP calls and interpretation

[Complete tool calls and responses](demonstration-2-camera-mcp-calls.json) preserve the real tool name `mcp__hw8_past_bugs__search_past_bugs`, exact arguments, text content, and structured responses:

1. `{"query":"camera"}`: 24 total matches, 20 returned, truncated.
2. `{"query":"camera following"}`: 2 matches, not truncated.
3. `{"query":"camera forward"}`: 5 matches, not truncated.

The responses identify `crossy-road-prompt-log.txt`. Line 64 describes the previous camera following chicken X/Z during every hop, shifting the whole world. Line 67 proposes smooth forward scrolling without left/right tracking. Line 77 describes ignoring chicken X/Y and advancing only after new forward progress. Line 2 establishes stable hops and smooth scrolling as original requirements. The local source log is `logs/crossy-road-prompt-log.txt`.

This history explains why the implementation used a historical maximum: it avoided backwards camera motion and lateral bounce. The new failure reveals a conflict between that forward-only policy and unrestricted retreat. The historical reports informed which behavior to preserve; they are historical data and earlier assistant claims, not proof of installed fixes or passing tests.

## Diagnosis and minimal production change

`tryMove()` permits retreat to any nonnegative lane. `finishHop()` updates `currentLaneIndex` on every completed hop but only raises `highestLane`. The old camera therefore retained its lane-20 target of -68 even after returning to lane 0.

[Production patch](demonstration-2-camera.patch): change the camera progress input from `highestLane - 3` to `currentLaneIndex - 3`, with a comment explaining that `highestLane` is for scoring. This is the only production change.

The camera now eases toward the current completed lane in either direction. The three-lane buffer, 0.035 interpolation factor, fixed camera X/Y `(8,16)`, fixed look-at X/Y `(0,0)`, and skyline offset remain unchanged. Sideways hops and the vertical hop arc do not create new camera targets. During new forward progress, current lane equals highest lane, so the forward target and easing are unchanged. Scoring and lane generation still use the historical maximum. Revisiting old lanes now scrolls the camera with the player; it does not increase the score.

## Focused executed tests

Test source: `tests/test_crossyroad_camera.cjs`. Run from the workspace root:

```sh
node --test hw8-agent-toolkit/tests/test_crossyroad_camera.cjs
node --check crossyroad/game.js
```

The Node harness extracts and executes production `tryMove`, `finishHop`, `updateCamera`, and `animate` code with deterministic time. Safe plaza lanes, rendering, collision checks, and external objects are stubbed to isolate camera movement. Three.js lerp is represented by its arithmetic formula. Visibility is checked with an independent orthographic view-basis calculation matching the production camera/frustum, including near/far depth.

- Sideways: left/right hops across grid limits at lanes 0 and 12 leave a settled camera unchanged; camera X/Y and aim X/Y stay fixed. Sideways input during outstanding forward easing produces the same camera trajectory as idle at the same lane.
- Forward: lanes 0 through 20 preserve the three-lane buffer and per-frame 0.035 easing, move monotonically toward each target without snapping, settle to cameraZ -68, and yield score 20.
- Backward: advance to 20, settle, retreat through every lane to 0. Check main-body-center visibility on every backward frame at simulated 30/60/120 fps for grid X -3/0/3 (nine combinations) in a 16:9 viewport. Camera settles to 0; score/highestLane remain 20; moving forward again within the previous maximum retains score 20.

[Before fix, final harness](demonstration-2-camera-before-tests.txt): 2 passed, 1 failed, exit 1. The failing backward test shows cameraZ -68 and the projected body center outside the frustum. It used `CAMERA_SOURCE=/tmp/hw8-camera-before.js` to test the pre-edit snapshot. That temporary file is session-local; the old code can also be reconstructed from the saved patch.

[After fix, final harness](demonstration-2-camera-after-tests.txt): 3 passed, 0 failed, exit 0. [Syntax check](demonstration-2-camera-syntax.txt): exit 0. [SHA-256 integrity record](demonstration-2-camera-integrity.json) identifies the before/after production source and final test source.

During test development, missing `THREE`/`scene` stubs and an incorrect projection-basis sign were corrected before the final baseline/retest. Those intermediate outputs are retained in [harness development outputs](demonstration-2-camera-harness-setup-error.txt); they are not game failures. A stricter feet/comb containment check also exposed existing forward clipping and partial backward edge clipping; the final test explicitly measures body-center visibility, matching the disappearance report. [Exploratory backward edge-clipping output](demonstration-2-camera-edge-clipping.txt) records a foot crossing the bottom edge near lane 1 with the patch installed. That stronger full-containment claim is not made.

## Limitations and pending independent work

- No browser playtest, screenshots, WebGL pixels, CDN loading, scene occlusion, or perceived smoothness were tested. Safe-lane simulation does not exercise traffic, rivers, death, or jersey rendering.
- Visibility means the main body center remains within the frustum in the tested 16:9 scenarios. Full chicken bounds, all screen aspect ratios, resize behavior, lower frame rates, and arbitrary lane distances are not certified.
- The existing per-frame easing remains frame-rate-dependent. At rapid forward hopping the comb can cross the top edge while the camera catches up. At 30 fps on retreat near the right grid limit, feet can partly cross the bottom edge. These do not invalidate the tested body-center visibility claim, but they warrant separate consideration if full containment is required.
- The camera intentionally scrolls backward now. Preserving literal forward-only scrolling would require a different gameplay policy for retreat, which was outside this fix.
- Feature Check was not invoked. The user will run it independently afterward; its result and the student's own reflection remain pending.

# Demonstration 1: Crossy Road camera review

Date: November 8, 2026 (America/New_York).

## Scope and evidence

Reviewed the actual project at `/Users/kadiekeslar/Desktop/15113/crossyroad`, which is `../crossyroad` from `hw8-agent-toolkit`. From the workspace root, `../crossyroad` did not exist; the project was located at `./crossyroad` instead. No Crossy Road files were edited. Feature Check was not invoked.

This is a static source review, not a browser playtest. No gameplay, visual smoothness, frame rate, or regression test results are claimed. Actual MCP responses are preserved in [demonstration-1-camera-mcp-calls.json](demonstration-1-camera-mcp-calls.json), with exact tool name, query arguments, content, and structured results. The broad `camera` query reported 24 matches and returned 20 (`truncated: true`); the focused `camera left` and `camera forward` queries were not truncated. These are real calls to `mcp__hw8_past_bugs__search_past_bugs`, not simulated searches or direct calls to a local replacement.

## Historical bug retrieved by MCP

The `camera forward` query returned `logs/crossy-road-prompt-log.txt:64`, describing a previous camera that followed the chicken's X and Z during every hop, shifting the world on arrow presses. The `camera left` query returned line 67, proposing forward-only scrolling without following left/right movement. Line 77, returned by `camera forward`, says the revised camera avoids the chicken's X/Y and advances only on new forward rows. Line 2 states the original stability and smooth-scroll requirement.

These passages establish historical intent and prior diagnosis. They include earlier assistant claims and replacement-code placeholders; they do not prove that a fix was installed or that gameplay passed a test. The current source was inspected separately below.

## Current code and conclusions

### Left/right input does not drive camera bounce

- `crossyroad/index.html:31–32` loads Three.js and this project's `game.js`, establishing the active implementation.
- `crossyroad/game.js:2715–2735` maps left/right to `tryMove(-1, 0)` / `tryMove(1, 0)`. The zero lane movement leaves the lane unchanged (`2550–2557`). Targets are derived from grid X and lane index (`2590–2608`).
- The hop moves the chicken's X/Z using interpolation (`3205–3218`) and its Y using a sine arc of height 1.2 (`3221–3226`). That vertical arc is player animation, not camera motion.
- `finishHop()` updates the current lane and raises `highestLane` only when landing beyond the previous maximum (`2758–2772`). Sideways moves cannot raise this maximum.
- `updateCamera()` (`3099–3139`) reads `highestLane`, `TILE`, and `cameraZ`; it does not read the chicken's X, Y, or Z. Camera X/Y remain fixed at `(8,16)` (`3121–3125`), and the look-at X/Y remain `(0,0)` (`3128–3132`). Both camera and look-at Z use the same `cameraZ`, preserving the viewing direction during scrolling. The projection is orthographic (`67–68`).

Conclusion: the historical direct coupling that caused sideways/hop camera bounce is absent in this source. A left/right hop from an already settled camera does not create a new camera target. If a previous forward move left the camera catching up, scrolling continues during a sideways hop or while idle because `updateCamera()` runs every frame (`3256`); that is residual forward easing, not new sideways tracking. This distinction should be checked in a future playtest.

### Forward scrolling is eased and only advances after new progress

`updateCamera()` computes `progress = max(0, highestLane - 3)` and `target = -progress * TILE` (`3101–3110`), with `TILE = 4` (`6`). The first three completed forward rows do not scroll. Completing row 4 first changes the target to -4. Because `highestLane` never decreases, backing up does not reverse the camera target, and revisiting an already reached row does not advance it.

The camera approaches the target with `lerp(cameraZ, target, 0.035)` (`3113–3118`), rather than snapping directly to the new row. For finite values, each update closes 3.5% of the remaining gap, so this is monotonic easing toward a fixed target. `finishHop()` commits progress after landing (`2745–2772`), and the frame loop calls it before `updateCamera()` (`3229–3234`, `3256`). Scrolling therefore starts after a new furthest landing, not continuously throughout the forward hop. The skyline moves with the camera at `cameraZ - 58` (`3135–3138`).

Conclusion: the source implements smooth interpolation and forward-only targets. Perceived smoothness on actual hardware remains unverified.

## Problems and limitations identified

1. **Frame-rate-dependent camera easing (confirmed implementation issue).** `game.js:3113–3118` uses a fixed 0.035 factor per rendered frame. `animate()` computes `delta` (`3177–3181`) and passes it to moving objects and the river player (`3242–3249`), but calls `updateCamera()` without it (`3256`). A slower frame rate therefore makes the camera catch up more slowly in real time, while hopping uses elapsed time (`3194–3202`). For a fixed target, the remaining camera gap after N frames is `initialGap * 0.965^N`. Algebraically, closing 90% takes about 64.6 frames: approximately 2.15 seconds at 30 fps, 1.08 seconds at 60 fps, or 0.54 seconds at 120 fps. These are calculations from the recurrence, not measured frame rates or executed test results. A possible future fix is elapsed-time easing, such as `alpha = 1 - exp(-k * delta)` with `k` chosen for the desired response; no fix was applied.

2. **Backtracking can leave the player behind the view (source-derived risk).** `tryMove()` only rejects negative lane indices (`2571–2575`), so it permits unlimited retreat toward lane 0 after substantial forward progress. Camera progress uses the historical maximum (`3101–3110`), while the finite orthographic view (`71–92`) does not follow the player backward. At sufficiently large separation, the player will be outside that view. This follows from the movement and camera rules; the exact visible cutoff was not measured. If unrestricted backtracking is intended, this needs a design decision. Restricting retreat or explicitly handling a player behind the camera could preserve forward-only scrolling.

3. **Documentation is stale.** `crossyroad/README.md:40–45` describes a camera at `(0,9,9)` aimed at `(0,0,0)` with an 18-by-14 view. Actual initial placement is `(8,16,15)` aimed at `(0,0,-7)` (`game.js:3142–3153`), and projection uses `CAMERA_SIZE = 25` and the viewport aspect (`65–87`). The README is not reliable evidence for the current camera behavior.

## Verification performed and remaining work

Performed: three actual MCP searches; source inspection of the project files; tracing input, hop completion, progress tracking, camera transforms, projection, and frame-loop call order. A numbered source snapshot and SHA-256 file integrity record are saved alongside this report.

Not performed: browser playtest, screenshots, frame-rate measurement, automated gameplay tests, or Feature Check. A future manual check should compare left/right from a settled start, forward motion through row 4, sideways input while forward easing remains active, and behavior at different frame rates. These are proposed checks, not results.

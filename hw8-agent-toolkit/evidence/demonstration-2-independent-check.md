# Demonstration 2 — Independent feature check

Reviewed November 8, 2026 using `.agents/skills/feature-check/SKILL.md`.

Target: `../crossyroad/game.js` (paths below are relative to `hw8-agent-toolkit`).
SHA-256: `78c949d3bbacc829413d024a475814b1316d920da9840036da1fb463094bb573`.

This review read the feature-check skill, current game source/index, and existing camera test source. It did not read previous agent conclusions, logs, iteration notes, verification reports, or existing evidence. No game or test files were modified. This report is the user-requested exception to the skill's no-file-modification rule.

## Results

| Expected behavior | Status | Executed evidence and relevant lines |
| --- | --- | --- |
| Left/right movement does not cause camera bouncing | **PASS** | Existing test exercised 12 sideways hops at lanes 0 and 12, including both lateral boundaries. Settled `cameraZ` changed by less than `1e-9`; camera X/Y and aim X/Y remained fixed. A paired run confirmed identical residual forward easing with and without a sideways hop. Test: `tests/test_crossyroad_camera.cjs:96–117`. Production: `../crossyroad/game.js:3101–3133` uses completed lane index and fixed position/aim offsets, independent of chicken hop height and horizontal position. |
| Forward movement scrolls smoothly | **PASS** (numerical easing) | Existing test traversed lanes 1–20 and checked each sampled camera update against `previous + (target - previous) * 0.035` within `1e-10`, with monotonic movement and no target overshoot. Camera settled at Z = -68 and score = 20. Test: `tests/test_crossyroad_camera.cjs:119–133`. Production: `../crossyroad/game.js:3101–3119`, called each animation frame at line 3257. The first three lanes intentionally retain a stationary camera. Rendered perceptual smoothness is **UNVERIFIED**. |
| Moving backward keeps the chicken visible | **FAIL** for an unrestricted viewport requirement; **PASS** for sampled body-center visibility at 16:9 | Existing test passed lane 20 → 0 at 30/60/120 fps and grid X = -3/0/3. Supplemental projection checks repeated those nine combinations for three aspect ratios: 16:9 had 0/2,040 offscreen samples; 4:3 had 43/2,040; 9:16 had 1,296/2,040. Details below. Test basis: `tests/test_crossyroad_camera.cjs:69–94,135–150`. Production frustum: `../crossyroad/game.js:71–92`; lateral limit: lines 2563–2567; camera follow: lines 3101–3133. |
| Highest-lane scoring still works after backtracking | **PASS** | Existing test preserved highest lane and score = 20 after returning to lane 0 and moving forward once. Supplemental execution tested 0 → 20 → 0 → 20, a sideways hop, then lane 21. Score and score DOM text stayed 20 throughout backtracking/revisits/sideways movement, then both became 21 at the new high; `highestLane` became 21. Production: `../crossyroad/game.js:2754–2782`; independent initial state: lines 1508–1514. |

## Tests actually run

From the workspace root:

```sh
node --test hw8-agent-toolkit/tests/test_crossyroad_camera.cjs
node --check crossyroad/game.js
```

Camera suite: **3 tests passed, 0 failed, 0 skipped**. Syntax check: exit 0.

A supplemental Node stdin script reused only the harness/projection definitions preceding the existing test declarations. It evaluated the current production functions in a fresh VM context. The script replaced the harness's throwaway score element with one persistent in-memory element so score DOM text could be asserted. It did not change files. It ran the scoring sequence above and repeated backward movement with `projected(state, bodyCenter, aspect)` at 16:9, 4:3, and 9:16. Every frame sampled during each backward hop checked normalized X/Y against (-1, 1) and depth against (0.1, 230).

| Aspect ratio | Backward frame samples | Offscreen body-center samples | Maximum absolute normalized X | Maximum absolute normalized Y |
| --- | ---: | ---: | ---: | ---: |
| 16:9 | 2,040 | 0 | 0.818532 | 0.931619 |
| 4:3 | 2,040 | 43 | 1.091376 | 0.931619 |
| 9:16 | 2,040 | 1,296 | 2.586966 | 0.931619 |

### Visibility failure reproduction

Use the existing deterministic harness, advance to lane 20 at its default 60 fps, settle the camera, move left three times to grid X = -3, and immediately hop backward 20 times at 30 fps. For each backward frame, project the chicken's body center (position plus local Y = `1.45 * 1.15`) with aspect = 4/3.

The first failing sample has completed lane index 9, `cameraZ = -42.2622475556485`, normalized X = **-1.0032670211904386**, Y = -0.31187735840524505, depth = 17.85427953586377. The body center crosses the left viewport edge. This is geometric evidence, not a screenshot; it does not establish that the entire chicken disappears at 4:3. At portrait aspect the maximum absolute center X exceeds 2.58, a substantially larger visibility failure. Portrait's first failing sample already occurs during the first backward hop at grid X = -3, completed lane 20, normalized X = -1.4040998937685667.

The camera now retreats with `currentLaneIndex` instead of remaining tied to `highestLane`, so the sampled 16:9 backtracking regression is resolved. The aspect-dependent horizontal frustum and fixed camera X/aim still allow the visibility failures above.

## Evidence limits

These are executed production-function tests with deterministic time, safe synthetic lanes, stubbed rendering/Three.js interpolation, and independent orthographic projection math. They do not run a browser or WebGL. They do not verify scene occlusion, full-body containment, actual frame pacing, keyboard delivery, or random traffic/water interactions. The existing projection checks use the body center only. The easing factor is per frame, so a passing numerical easing test does not establish equal timing across display refresh rates.

No fixes were made.

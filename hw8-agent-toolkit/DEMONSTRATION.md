# Crossy Road demonstrations

November 6, 2026

I chose my Crossy Road game because I’d had trouble with the camera bouncing when I moved the chicken. For both runs, I used one Codex session to work on the game with `search_past_bugs` and opened a fresh session for Feature Check. The [session excerpts](evidence/crossyroad-session-excerpts.md) show the four session IDs, prompts, tool calls, and checker results.

## Run 1 — Review the camera

I asked Codex to look up my old camera problems and inspect the current game. It called search_past_bugs with camera, camera left, and camera forward. The results included my report about the screen bouncing and the earlier discussion about keeping the camera still on sideways hops. Codex traced the movement code and spotted a risk when the player moved backward. [Tool calls and responses](evidence/demonstration-1-camera-mcp-calls.json) · [Work-session report](evidence/demonstration-1-camera-review.md)

In a separate session, Feature Check ran the movement and camera functions in memory. Sideways movement passed, and the camera eased toward its target when moving forward. Backtracking failed. After the chicken went from lane 20 back to lane 0, the camera stayed near lane 20 and the chicken’s position projected outside the view. I agreed with the checker based on that test, and used the finding to guide the second run. [Checker transcript and test output](evidence/crossyroad-session-excerpts.md#run-1-separate-checker)

## Run 2 — Fix backtracking and check again

I asked Codex to fix backtracking while keeping the sideways stability and forward easing. It called `search_past_bugs` with `camera`, `camera following`, and `camera forward`. The old reports helped explain why the camera should ignore sideways motion. Codex changed the camera target to follow the current completed lane instead of the highest lane reached. The backward test failed before the change, and all three focused tests passed after it. [Tool calls and responses](evidence/demonstration-2-camera-mcp-calls.json) · [Game patch](evidence/demonstration-2-camera.patch) · [Before tests](evidence/demonstration-2-camera-before-tests.txt) · [After tests](evidence/demonstration-2-camera-after-tests.txt)

I opened another fresh Feature Check session. The checker confirmed sideways stability, forward easing, and highest-lane scoring. It also repeated the backward test at other screen sizes. The chicken’s center stayed in view in all 2,040 sampled frames at 16:9, but fell outside the view in 43 frames at 4:3 and 1,296 frames at 9:16. [Checker transcript](evidence/crossyroad-session-excerpts.md#run-2-separate-checker) · [Full test report](evidence/demonstration-2-independent-check.md)

I agreed with the checker that the fix worked for the tested 16:9 case and that the narrower views still had a problem. I based that on the simulation and projection results. How smooth the game looks and whether the full chicken stays visible in the browser were still unverified. The gap in the tests is what I addressed in [ITERATION.md](ITERATION.md).

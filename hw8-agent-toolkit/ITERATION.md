# Feature Check iteration and actual blind retest

Recorded November 6, 2026 (America/New_York). This iteration changes the reusable Feature Check instructions. The Crossy Road bug fix is a separate implementation change, summarized below as context.

## Original Feature Check

The full original skill was copied before editing to [feature-check-before-iteration.SKILL.md](evidence/feature-check-before-iteration.SKILL.md). Its original instructions were:

> 1. Identify what the feature is supposed to do.
> 2. Find the code responsible for that feature.
> 3. Check whether the implementation matches the expected behavior.
> 4. Run existing tests when possible.
> 5. Report anything that fails or cannot be verified.

It already required PASS / FAIL / UNVERIFIED with supporting evidence, no file modifications, separation of test execution from inspection, and no invented results. Its instructions did not explicitly require checks beyond the normal path or existing tests.

## Observed coverage gap and separate game fix

[Demonstration 2](evidence/demonstration-2-camera-review.md) records a game change from `highestLane - 3` to `currentLaneIndex - 3` in camera progress. The [pre-fix test](evidence/demonstration-2-camera-before-tests.txt) had 2 passes / 1 failure; the [post-fix test](evidence/demonstration-2-camera-after-tests.txt) had 3 passes / 0 failures. This resolved the sampled 16:9 lane-20-to-0 body-center regression while preserving tested sideways stability, forward easing, and maximum scoring. Feature Check was not invoked in that implementation session.

The [later independent Feature Check report](evidence/demonstration-2-independent-check.md) passed those existing tests but found additional backward visibility failures at narrower ratios: 43/2,040 offscreen body-center samples at 4:3 and 1,296/2,040 at 9:16, versus zero at 16:9. This establishes a coverage gap in the existing game tests. It does not establish that the old skill invariably missed edge cases; that independent review itself performed additional checks.

I think the main problem was that my original Feature Check skill was too focused on checking whether the basic functionality worked. It told Codex to run available tests, but it did not specifically ask it to consider edge cases or make sure that fixing one problem did not cause another. During the Crossy Road demonstrations, the existing tests passed after the camera fix, but the independent checker still found problems with certain screen sizes. This made me realize that passing the normal tests was not always enough to confirm that a feature worked correctly.

I decided to update the skill so that it would check relevant edge cases, boundary conditions, and possible regressions before reporting that something passed. I wanted this to be a general instruction that would work across different projects rather than something specific to my Crossy Road game. The original checker did identify problems when asked to investigate them, so I would not say that it completely failed. I just thought the instructions could be improved to make the checking process more thorough without me having to specifically ask about every possible issue.e without supporting evidence.

## Skill revision: require edge cases and regressions

Only the skill instructions were changed for this revision; the game and existing camera tests were not changed. [Exact patch](evidence/feature-check-iteration.patch), [current skill](.agents/skills/feature-check/SKILL.md), and [successful validation](evidence/feature-check-validation.txt).

Instructions 1–2 were retained. Instructions 3–5 now read:

> 3. Identify relevant edge cases, boundary conditions, and regressions in related behavior; do not limit coverage to the normal path or existing tests.
> 4. Check expected behavior with existing tests and targeted checks when possible, including those edge cases and regressions.
> 5. Report coverage, actual results, and anything that fails or cannot be verified. Declare the feature fully verified only when relevant checks pass; missing evidence remains UNVERIFIED.

The status format and original rules, including “Do not modify any files,” remain. The revision is general: it does not name the game, camera, aspect ratios, or a known bug.

## Actual blind retest protocol

The [saved protocol](evidence/feature-check-iteration-retest.md), [launch command](evidence/feature-check-blind-command.txt), and [manifest](evidence/feature-check-blind-manifest.json) record a new ephemeral `codex exec` session, not a resume or fork, with user config ignored and a read-only checker sandbox.

Exact and only prompt, preserved in [the prompt file](evidence/feature-check-blind-prompt.txt):

> Verify the Crossy Road camera movement feature.

Successful thread ID: `01a1bd5f-cb0a-77e0-9da0-39bd6ce69ef7`.

The clean temporary workspace contained byte-for-byte copies of the revised discoverable skill, four game files, and the existing camera test. It contained no prior review, conversation, evidence folder, known-bug hint, or ITERATION.md. Existing tests did expose their own coverage. The checker automatically selected and read the revised skill; there were no follow-up prompts.

The initial outer-sandbox launch failed before a checker thread started ([stderr](evidence/feature-check-blind-stderr.txt)). The successful retry used outer sandbox escalation to initialize the local app server; the checker itself stayed read-only. This startup failure is separate from a feature test failure.

## Observed blind retest results

[Raw successful JSONL](evidence/feature-check-blind-retry-transcript.jsonl), [readable transcript](evidence/feature-check-blind-transcript.txt), [actual commands/results](evidence/feature-check-blind-test-results.txt), and [verbatim final response](evidence/feature-check-blind-final.txt).

| Check | Actual result |
| --- | --- |
| Existing camera suite | PASS: 3 tests, 0 failures; sideways stability, three-lane forward buffer/easing, and backward body-center visibility at 16:9 with simulated 30/60/120 fps and grid X -3/0/3. |
| Additional runtime assertions | PASS: movement boundaries, queued hops/initial buffer, skyline offset. |
| Added viewport checks | FAIL: settled lane 20, grid X=3 body center outside square and portrait viewports. |
| Browser/WebGL appearance, occlusion, live resize | UNVERIFIED. |

The transcript records the checker deciding to check movement boundaries, queued hops, and narrow viewports after running the existing suite. Actual projected normalized coordinates:

| Aspect ratio | x | y | Body-center projection |
| --- | ---: | ---: | --- |
| 16:9 | 0.5843806378782703 | 0.1371304167367599 | Inside |
| 1:1 | 1.0388989117835916 | 0.1371304167367599 | Outside |
| 9:16 | 1.8469313987263851 | 0.1371304167367599 | Outside |

Absolute x greater than 1 is outside the horizontal frustum. The checker concluded that camera movement was partially verified and narrow viewports had a visibility issue; it did not declare full verification.

[Integrity comparison](evidence/feature-check-blind-integrity.json) records that all six copied files retained their original hashes, still matched the workspace counterparts, and no additional files appeared in the clean workspace. The retest made no game or test changes.

## Interpretation and limitations

This single blind run shows that the revised skill was loaded and the checker extended coverage beyond existing tests without a viewport hint. It does not prove causation, exhaustive coverage, or reliable behavior across future tasks.

The added failure was at a settled lane-20 position. The checker did not test 4:3 or run the backward sequence at square/portrait ratios, so it did not independently reproduce the exact earlier backward-visibility failure. Those two checker results must not be conflated.

The retest used deterministic safe-lane simulation and projection math, not browser/WebGL rendering. It does not establish full-body containment, scene occlusion, actual smoothness, or live resize behavior. The game still has known viewport limitations and frame-dependent easing. Revising the checker did not fix those game issues.

## Student assessment and reflection

I think the retest showed that my changes to the Feature Check skill were helpful. After updating the instructions, I had Codex test the camera functionality again without specifically telling it about the screen size problems. This time, it independently checked different aspect ratios and found clipping issues in square and portrait layouts, even though the three existing tests passed. This was what I wanted from the revision because I wanted the skill to look beyond the basic tests and consider other situations where a feature might not work correctly.

I agree with the results based on the evidence from the simulated tests, although some situations, including backward movement at narrower screen sizes, were still unverified. I also cannot confirm exactly how the game looks in a browser from these results alone. If I continued improving the skill, I would want it to identify which edge cases have not been tested and recommend additional ways to verify them, especially through actual browser testing. Overall, I think the revision made the checker more useful and helped it catch problems that could have been overlooked.


/////

This iteration helped me understand that reusable checker instructions need to be specific enough to guide Codex but also general enough to work on different projects. I learned that just telling AI to test whether something works is not always enough because it might only check the most obvious cases. By adding instructions to check edge cases and regressions, I was able to make my Feature Check skill more useful without having to list every possible problem myself.

I also learned that passing tests does not necessarily mean a feature is completely working. The camera fix passed the original tests, but additional checks still found issues with different screen sizes. Another important thing I learned was the difference between fixing a problem in my actual game and improving the toolkit. Changing the camera code fixed one specific issue, while updating the Feature Check skill should help Codex catch similar problems in future projects. Overall, I realized that the goal is not just to have AI fix mistakes, but to create tools that make it better at finding those mistakes in the first place.
# Feature Check toolkit iteration and blind retest

Date: November 8, 2026 (America/New_York).

## Revision

Only `.agents/skills/feature-check/SKILL.md` was revised. Instructions 3–5 now require relevant edge cases, boundary conditions, regressions in related behavior, and targeted checks beyond the existing tests. The report must state coverage and actual results. A feature is fully verified only when relevant checks pass; missing evidence remains UNVERIFIED. The revision contains no game-specific or viewport-specific instructions. PASS / FAIL / UNVERIFIED and every original rule, including “Do not modify any files,” are preserved.

The original was copied **before editing** to [feature-check-before-iteration.SKILL.md](feature-check-before-iteration.SKILL.md). See the [exact patch](feature-check-iteration.patch) and [successful skill validation](feature-check-validation.txt).

## Fresh checker protocol

A new `codex exec` session (no resume or fork), ephemeral, with user config ignored and a read-only checker sandbox, received exactly:

> Verify the Crossy Road camera movement feature.

Session ID: `01a1bd5f-cb0a-77e0-9da0-39bd6ce69ef7`.

The clean temporary workspace contained byte-for-byte copies of the revised discoverable skill, four game files, and the existing camera regression test. No prior review, known bug, conversation, evidence, or ITERATION.md was supplied. The existing test file naturally exposed its current coverage; it was not changed. The checker automatically selected and read the revised skill.

See [input manifest and initial hashes](feature-check-blind-manifest.json), [exact prompt](feature-check-blind-prompt.txt), and [launch command](feature-check-blind-command.txt). The initial sandboxed launch failed before a checker thread started; its [stderr](feature-check-blind-stderr.txt) is preserved. The successful retry required outer sandbox escalation to start the local app server; the checker itself remained read-only. There were no follow-up prompts or hints.

## Observed results

**Independent consideration of different viewport sizes: YES.** After running the existing tests, the checker stated: “I’ll check movement boundaries, queued hops, and narrow viewports next.” It then executed in-memory checks using the existing harness, without writing files.

- **PASS:** Existing suite: 3 tests passed, 0 failed. Sideways stability, forward buffer/easing, and lane 20 → 0 visibility at 30/60/120 fps and grid X -3/0/3 in the suite’s default 16:9 projection.
- **PASS:** Additional runtime assertions: movement boundaries, queued hops and initial buffer, skyline offset.
- **FAIL:** Additional viewport checks found horizontal clipping of the body center at settled lane 20, grid X=3. The projected normalized coordinates below are actual checker command output; abs(x) > 1 lies outside the horizontal frustum.

| Aspect ratio | Projected x | Projected y | Geometric body-center visibility |
| --- | ---: | ---: | --- |
| 16:9 | 0.5843806378782703 | 0.1371304167367599 | Inside |
| 1:1 | 1.0388989117835916 | 0.1371304167367599 | Outside |
| 9:16 | 1.8469313987263851 | 0.1371304167367599 | Outside |

The checker concluded: “Camera movement is partially verified; narrow viewports have a visibility issue.” It did not declare the feature fully verified.

**Limits / UNVERIFIED:** This run used deterministic safe-lane simulation and geometric projection, not browser rendering. Browser/WebGL appearance, occlusion, and live resize behavior remain unverified. The checker did **not** test 4:3 or run the backward-movement sequence at square/portrait ratios. Its added failure is a settled-position narrow-viewport failure; this retest does not establish independent reproduction of the exact previously reported backward-visibility bug. One blind run shows broader coverage, not guaranteed exhaustive verification.

## Actual evidence

- [Raw complete JSONL transcript](feature-check-blind-retry-transcript.jsonl)
- [Readable checker messages, commands, and outputs](feature-check-blind-transcript.txt)
- [Extracted actual test commands and results](feature-check-blind-test-results.txt)
- [Checker final response, verbatim](feature-check-blind-final.txt)
- [Successful-run stderr](feature-check-blind-retry-stderr.txt)
- [File integrity comparison](feature-check-blind-integrity.json)

All six files in the checker workspace retained their original SHA-256 hashes, and no new files appeared.

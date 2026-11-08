# Feature Check iteration

November 6, 2026

## What I missed

After the Crossy Road backtracking fix, all three camera tests passed. A separate Feature Check session tried narrower screen sizes and found that the chicken’s center could still leave the view. The existing tests used 16:9. The original skill told Codex to run existing tests when possible, which left it up to the agent to decide whether to look for cases those tests missed. My second checker did look further, and I wanted that to be part of the instructions every time. [Original skill](evidence/feature-check-before-iteration.SKILL.md) · [Independent check](evidence/demonstration-2-independent-check.md)

## What I changed

I updated Feature Check to look for relevant edge cases, boundary conditions, and regressions. It now asks for targeted checks beyond the existing tests and requires the report to show what was tested and what is still unverified. I kept those instructions general so they would work on my other projects. This revision changed the skill file only. [Skill diff](evidence/feature-check-iteration.patch) · [Revised skill](.agents/skills/feature-check/SKILL.md)

## What happened when I reran it

I started a fresh read-only Codex session with the revised skill, the game, and the existing camera tests. My only prompt was “Verify the Crossy Road camera movement feature.” I left out the earlier reviews and gave no hint about screen sizes. [Retest setup](evidence/feature-check-iteration-retest.md)

Codex picked up Feature Check and ran all three camera tests successfully. It then checked movement boundaries, queued hops, and different viewport sizes on its own. At lane 20 on the right side of the grid, it found the chicken’s center outside the square and portrait views. It reported the feature as partially verified. That was a different check from the earlier backward-hop test, and it still used simulated movement. [Checker transcript](evidence/feature-check-blind-transcript.txt) · [Test output](evidence/feature-check-blind-test-results.txt)

That was what I wanted from the revision. The checker went past the passing tests without me having to name the edge case. I still haven’t verified how the camera looks in a browser at those sizes.

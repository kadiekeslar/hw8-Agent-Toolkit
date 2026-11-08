---
name: change-scope-check
description: Review Git changes against the requested scope and identify unrelated changes without editing files.
---

# Change Scope Check

- Establish the requested change and comparison base from the user; inspect Git status, staged and unstaged diffs, and relevant untracked files.
- Compare changed behavior and files with the request. Flag unrelated edits, accidental deletions, and generated or sensitive files with evidence.
- Report IN SCOPE, OUT OF SCOPE, or UNCLEAR per finding, with paths and reasons. If Git or the base is unavailable, state the limitation.
- Report only; do not edit, stage, revert, or commit files.

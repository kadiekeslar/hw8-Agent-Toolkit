---
name: feature-check
description: Reviews implemented features and bug fixes to verify they work as requested. Use when checking functionality after coding or debugging. Reports results without modifying code.
---

# Feature Check

Review an implemented feature to see if it works as requested.

## Instructions

1. Identify what the feature is supposed to do.
2. Find the code responsible for that feature.
3. Identify relevant edge cases, boundary conditions, and regressions in related behavior; do not limit coverage to the normal path or existing tests.
4. Check expected behavior with existing tests and targeted checks when possible, including those edge cases and regressions.
5. Report coverage, actual results, and anything that fails or cannot be verified. Declare the feature fully verified only when relevant checks pass; missing evidence remains UNVERIFIED.

## Output Format

For each expected behavior, report:

- PASS: Verified by a test or direct observation.
- FAIL: A problem was found.
- UNVERIFIED: Not enough evidence to confirm.

Include the expected behavior, status, and supporting evidence.

## Rules

- Do not modify any files.
- Do not assume code works just because it looks correct.
- Cite relevant files and line numbers when possible.
- Distinguish tests you ran from code inspection.
- Never invent test results.
- Report problems without fixing them.

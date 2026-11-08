---
name: test-generator
description: Create tests for requested code covering normal behavior, edge cases, and invalid input.
---

# Test Generator

- Inspect the target behavior and existing test framework; reuse project conventions and clarify ambiguous expected results.
- Add focused tests for normal cases, boundaries or empty values, and invalid inputs appropriate to the interface.
- Assert observable outcomes rather than implementation details. Isolate external services with controlled fixtures or mocks where needed.
- Run the relevant tests when possible. Report files created, coverage rationale, actual command/results, and tests not run; never invent a pass.

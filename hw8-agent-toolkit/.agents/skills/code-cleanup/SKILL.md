---
name: code-cleanup
description: Suggest simpler, clearer code that preserves behavior; apply cleanup only when the user requests edits.
---

# Code Cleanup

- Inspect the relevant code and identify specific unnecessary complexity, duplication, or confusing names.
- Propose small simplifications, explaining how behavior stays the same and any tradeoffs.
- Suggest only unless the user requested cleanup edits. Keep authorized edits within scope and preserve public interfaces and edge cases.
- Run relevant existing checks after edits when available; report what ran, results, and any unverified behavior.

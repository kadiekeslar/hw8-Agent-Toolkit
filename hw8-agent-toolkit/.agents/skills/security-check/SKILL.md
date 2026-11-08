---
name: security-check
description: Review code for exposed secrets and unsafe input handling and report findings without edits.
---

# Security Check

- Inspect the requested files for credentials and unsafe handling of untrusted input, including injection, path traversal, and unsafe rendering where relevant.
- Cite affected paths and line numbers, describe the input-to-effect path, and separate confirmed findings from suspected risks.
- Redact secret values in all output; identify location and credential type without reproducing the value.
- Suggest focused remediation and explain review limits. Report only; do not edit files, test live credentials, or perform destructive probes.

"""Validate frontmatter and optionally assert Codex discovery evidence."""
import json
from pathlib import Path
import sys

import yaml

ROOT = Path(__file__).resolve().parents[1]
EXPECTED = {"feature-check", "requirements-check", "change-scope-check", "code-explanation",
            "code-cleanup", "test-generator", "security-check", "performance-check"}
paths = list((ROOT / ".agents/skills").glob("*/SKILL.md"))
found = set()
for path in sorted(paths):
    if path.parent.name == "test-skill":
        continue
    text = path.read_text()
    assert text.startswith("---\n"), f"Frontmatter must start on line 1: {path}"
    parts = text.split("---", 2)
    assert len(parts) == 3, path
    data = yaml.safe_load(parts[1])
    assert isinstance(data, dict), path
    assert data.get("name") == path.parent.name, path
    assert isinstance(data.get("description"), str) and data["description"].strip(), path
    assert parts[2].strip(), path
    found.add(data["name"])
    print(f"VALID: {data['name']}")
assert found == EXPECTED, (found, EXPECTED)
if len(sys.argv) > 1:
    discovery = json.dumps(json.loads(Path(sys.argv[1]).read_text()))
    for name in sorted(EXPECTED):
        assert f"- {name}:" in discovery, f"Not discovered: {name}"
        assert f"/{name}/SKILL.md" in discovery, name
        print(f"CODEX DISCOVERED: {name}")

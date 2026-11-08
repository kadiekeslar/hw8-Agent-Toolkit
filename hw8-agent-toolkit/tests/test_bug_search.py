import importlib.util
from pathlib import Path
import tempfile
import unittest

SPEC = importlib.util.spec_from_file_location("bug_search", Path(__file__).resolve().parents[1] / "mcp/bug_search.py")
server = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(server)


class SearchTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "sample.md").write_text("intro\nCollision ERROR\ncontext\n", encoding="utf-8")
        (self.root / "nested").mkdir()
        (self.root / "nested/second.txt").write_text("collision error\n", encoding="utf-8")
        (self.root / "ignored.py").write_text("collision error\n")

    def test_passages_and_line_numbers(self):
        result = server.search_logs("ERROR collision", self.root)
        self.assertEqual(result["total_matches"], 2)
        hit = next(x for x in result["matches"] if x["filename"] == "sample.md")
        self.assertEqual((hit["match_line"], hit["start_line"], hit["end_line"]), (2, 1, 3))
        self.assertEqual(hit["passage"], "1: intro\n2: Collision ERROR\n3: context")

    def test_no_match_and_literal_input(self):
        for query in ["absent", ".*", "../../outside", "collision absent"]:
            self.assertEqual(server.search_logs(query, self.root)["matches"], [])

    def test_invalid_query(self):
        for query in ["", " \n ", "x" * 501]:
            with self.assertRaises(ValueError):
                server.search_logs(query, self.root)

    def test_empty_and_missing_corpus(self):
        self.assertEqual(server.search_logs("error", self.root / "nested")["total_matches"], 1)
        with self.assertRaises(ValueError):
            server.search_logs("error", self.root / "missing")
        (self.root / "empty").mkdir()
        self.assertEqual(server.search_logs("error", self.root / "empty")["total_matches"], 0)

    def test_limit_and_unreadable_text(self):
        (self.root / "many.txt").write_text("error\n" * 25)
        (self.root / "bad.txt").write_bytes(b"\xff")
        result = server.search_logs("error", self.root)
        self.assertEqual(len(result["matches"]), 20)
        self.assertEqual(result["total_matches"], 27)
        self.assertTrue(result["truncated"])
        self.assertTrue(result["warnings"])

    def test_external_symlink_is_skipped(self):
        with tempfile.TemporaryDirectory() as outside:
            target = Path(outside) / "secret.txt"
            target.write_text("collision error")
            (self.root / "link.txt").symlink_to(target)
            self.assertEqual(server.search_logs("collision", self.root)["total_matches"], 2)


if __name__ == "__main__":
    unittest.main()

"""Start the actual stdio server and exercise its advertised MCP tool."""
import asyncio
import json
from pathlib import Path
import sys

from fastmcp import Client
from fastmcp.client.transports import StdioTransport

ROOT = Path(__file__).resolve().parents[1]


async def main():
    transport = StdioTransport(command=sys.executable, args=[str(ROOT / "mcp/bug_search.py")], cwd="/tmp")
    async with Client(transport) as client:
        tools = await client.list_tools()
        assert [tool.name for tool in tools] == ["search_past_bugs"]
        assert tools[0].annotations.readOnlyHint is True
        result = await client.call_tool("search_past_bugs", {"query": "camera"})
        data = result.data
        assert data["total_matches"] > 0, data
        assert all(hit["filename"] and hit["match_line"] >= 1 for hit in data["matches"])
        empty = await client.call_tool("search_past_bugs", {"query": "zzzz_no_such_bug_7351"})
        assert empty.data["matches"] == []
        invalid = await client.call_tool("search_past_bugs", {"query": " "}, raise_on_error=False)
        assert invalid.is_error
        print(json.dumps({"tools": [tool.name for tool in tools], "camera_result": data,
                          "no_match": empty.data, "blank_query_rejected": invalid.is_error}, indent=2))


if __name__ == "__main__":
    asyncio.run(main())

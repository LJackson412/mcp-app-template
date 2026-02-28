import fastmcp
from fastmcp import FastMCP
from pathlib import Path

from tools.greet import register_greet_tool

fastmcp.settings.stateless_http = True

mcp = FastMCP("My MCP Server")

GREET_WIDGET_HTML_PATH = Path(__file__).resolve().parents[2] / "mcp-ui" / "greet" / "greet.html"


@mcp.resource("ui://widget/greet.html", mime_type="text/html+skybridge")
def get_greet_widget() -> str:
    """Interactive HTML widget to display retrieval segments in ChatGPT."""
    if not GREET_WIDGET_HTML_PATH.exists():
        raise FileNotFoundError(
            f"Widget artifact not found at {GREET_WIDGET_HTML_PATH}. Build the UI first with: "
            "cd mcp-ui && npm install && npm run build"
        )

    return GREET_WIDGET_HTML_PATH.read_text(encoding="utf-8")


register_greet_tool(mcp)


if __name__ == "__main__":
    mcp.run(transport="http", port=8000)

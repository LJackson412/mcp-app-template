from typing import Any

from fastmcp import FastMCP
from pydantic import BaseModel


class GreetResult(BaseModel):
    name: str
    message: str


def register_greet_tool(mcp: FastMCP) -> None:
    @mcp.tool(
        annotations={
            "title": "Retrieval",
            "readOnlyHint": True,
        },
        meta={
            "ui": {
                "resourceUri": "ui://widget/greet.html",
            },
            "openai/outputTemplate": "ui://widget/greet.html",
            "openai/toolInvocation/invoking": "",
            "openai/toolInvocation/invoked": "",
        },
    )
    def greet(name: str) -> dict[str, Any]:
        """Mock greet tool that returns a greeting."""
        result = GreetResult(name=name, message=f"Hello, {name} 👋")
        return {
            "structuredContent": result.model_dump(),
            "content": [{"type": "text", "text": f"Generated greeting for {name}."}],
        }

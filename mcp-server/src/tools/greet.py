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
            "openai/outputTemplate": "ui://widget/greet.html",
            "openai/toolInvocation/invoking": "",
            "openai/toolInvocation/invoked": "",
        },
    )
    def greet(name: str) -> GreetResult:
        """Mock greet tool that returns a greeting."""
        return GreetResult(name=name, message=f"Hello, {name} 👋")
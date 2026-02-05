"""
Contract test for MCP tools to ensure they conform to expected interfaces.
"""

import pytest
from model_context_protocol import Tool
from backend.src.mcp_server.tools.task_tools import (
    add_task_tool,
    list_tasks_tool,
    update_task_tool,
    complete_task_tool,
    delete_task_tool
)


def test_add_task_tool_contract():
    """Test that add_task_tool conforms to the expected contract."""
    assert isinstance(add_task_tool, Tool)
    assert add_task_tool.name == "add_task"
    assert callable(add_task_tool.handler)
    assert hasattr(add_task_tool, 'parameters')


def test_list_tasks_tool_contract():
    """Test that list_tasks_tool conforms to the expected contract."""
    assert isinstance(list_tasks_tool, Tool)
    assert list_tasks_tool.name == "list_tasks"
    assert callable(list_tasks_tool.handler)
    assert hasattr(list_tasks_tool, 'parameters')


def test_update_task_tool_contract():
    """Test that update_task_tool conforms to the expected contract."""
    assert isinstance(update_task_tool, Tool)
    assert update_task_tool.name == "update_task"
    assert callable(update_task_tool.handler)
    assert hasattr(update_task_tool, 'parameters')


def test_complete_task_tool_contract():
    """Test that complete_task_tool conforms to the expected contract."""
    assert isinstance(complete_task_tool, Tool)
    assert complete_task_tool.name == "complete_task"
    assert callable(complete_task_tool.handler)
    assert hasattr(complete_task_tool, 'parameters')


def test_delete_task_tool_contract():
    """Test that delete_task_tool conforms to the expected contract."""
    assert isinstance(delete_task_tool, Tool)
    assert delete_task_tool.name == "delete_task"
    assert callable(delete_task_tool.handler)
    assert hasattr(delete_task_tool, 'parameters')


def test_all_tools_have_required_attributes():
    """Test that all tools have the required attributes."""
    tools = [
        add_task_tool,
        list_tasks_tool,
        update_task_tool,
        complete_task_tool,
        delete_task_tool
    ]

    for tool in tools:
        assert hasattr(tool, 'name'), f"Tool {tool.name} missing 'name' attribute"
        assert hasattr(tool, 'description'), f"Tool {tool.name} missing 'description' attribute"
        assert hasattr(tool, 'parameters'), f"Tool {tool.name} missing 'parameters' attribute"
        assert hasattr(tool, 'handler'), f"Tool {tool.name} missing 'handler' attribute"
        assert callable(tool.handler), f"Tool {tool.name} handler is not callable"


def test_tool_descriptions_not_empty():
    """Test that all tools have meaningful descriptions."""
    tools = [
        add_task_tool,
        list_tasks_tool,
        update_task_tool,
        complete_task_tool,
        delete_task_tool
    ]

    for tool in tools:
        assert tool.description is not None, f"Tool {tool.name} has None description"
        assert len(tool.description.strip()) > 0, f"Tool {tool.name} has empty description"
        assert len(tool.description.strip()) > 10, f"Tool {tool.name} description is too short"
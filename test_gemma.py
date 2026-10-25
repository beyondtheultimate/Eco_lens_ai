"""
Tests for Gemma 4 Ollama integration.
"""

import pytest
from unittest.mock import patch, MagicMock
from gemma_client import GemmaClient


def test_client_init():
    client = GemmaClient(host="http://localhost:11434", model="gemma4:e2b")
    assert client.host == "http://localhost:11434"
    assert client.model == "gemma4:e2b"


@patch("requests.get")
def test_is_ollama_running_success(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.text = "Ollama is running"
    mock_get.return_value = mock_resp

    client = GemmaClient()
    assert client.is_ollama_running() is True


@patch("requests.get")
def test_is_ollama_running_failure(mock_get):
    mock_get.side_effect = Exception("Connection refused")

    client = GemmaClient()
    assert client.is_ollama_running() is False


@patch("requests.get")
def test_list_models(mock_get):
    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "models": [{"name": "gemma4:e2b"}, {"name": "qwen2.5:3b"}]
    }
    mock_get.return_value = mock_resp

    client = GemmaClient()
    models = client.list_models()
    assert "gemma4:e2b" in models
    assert client.is_model_available("gemma4:e2b") is True
    assert client.is_model_available("nonexistent:latest") is False


@patch("requests.post")
@patch("requests.get")
def test_chat_non_streaming(mock_get, mock_post):
    # Mock is_ollama_running
    mock_get_resp = MagicMock()
    mock_get_resp.status_code = 200
    mock_get_resp.text = "Ollama is running"
    mock_get.return_value = mock_get_resp

    # Mock chat post
    mock_post_resp = MagicMock()
    mock_post_resp.status_code = 200
    mock_post_resp.json.return_value = {
        "message": {"content": "Hello from Gemma!"}
    }
    mock_post.return_value = mock_post_resp

    client = GemmaClient()
    reply = client.chat(messages=[{"role": "user", "content": "Hi"}], stream=False)
    assert reply == "Hello from Gemma!"

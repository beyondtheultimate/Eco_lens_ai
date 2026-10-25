"""
Gemma 4 Client for Ollama
Hackathon Starter Kit - MLH Hackathon Challenge: Best Use of Gemma 4
"""

import os
import sys
import json
import logging
from typing import Generator, Dict, Any, List, Optional
import requests

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

DEFAULT_OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
DEFAULT_MODEL = os.getenv("GEMMA_MODEL", "gemma4:e2b")


class GemmaClient:
    """Client for interacting with local Gemma 4 models running on Ollama."""

    def __init__(self, host: str = DEFAULT_OLLAMA_HOST, model: str = DEFAULT_MODEL, timeout: int = 60):
        self.host = host.rstrip("/")
        self.model = model
        self.timeout = timeout

    def is_ollama_running(self) -> bool:
        """Check if local Ollama server is up and reachable."""
        try:
            resp = requests.get(f"{self.host}/", timeout=3)
            return resp.status_code == 200 and "Ollama is running" in resp.text
        except Exception:
            return False

    def list_models(self) -> List[str]:
        """Return a list of locally installed model tags."""
        try:
            resp = requests.get(f"{self.host}/api/tags", timeout=5)
            if resp.status_code == 200:
                data = resp.json()
                return [m.get("name", "") for m in data.get("models", [])]
            return []
        except requests.RequestException as e:
            logger.warning("Failed to fetch model tags: %s", e)
            return []

    def is_model_available(self, model_name: Optional[str] = None) -> bool:
        """Check if target model is pulled and available locally."""
        target = model_name or self.model
        models = self.list_models()
        return any(target in m for m in models)

    def chat(
        self,
        messages: List[Dict[str, str]],
        stream: bool = False,
        temperature: float = 0.7,
        system_prompt: Optional[str] = None,
    ) -> Any:
        """
        Send chat messages to the Gemma model.
        Returns full text or a generator yielding tokens if stream=True.
        """
        if not self.is_ollama_running():
            raise ConnectionError(
                f"Ollama is not reachable at {self.host}. "
                "Please verify Ollama is running ('ollama serve' or check desktop app)."
            )

        payload_messages = []
        if system_prompt:
            payload_messages.append({"role": "system", "content": system_prompt})
        payload_messages.extend(messages)

        payload = {
            "model": self.model,
            "messages": payload_messages,
            "stream": stream,
            "options": {
                "temperature": temperature,
            },
        }

        url = f"{self.host}/api/chat"

        try:
            resp = requests.post(url, json=payload, stream=stream, timeout=self.timeout)
            resp.raise_for_status()

            if stream:
                return self._stream_response(resp)
            else:
                data = resp.json()
                return data.get("message", {}).get("content", "")

        except requests.exceptions.HTTPError as e:
            if resp.status_code == 404:
                raise RuntimeError(
                    f"Model '{self.model}' not found in local Ollama. "
                    f"Please run 'ollama pull {self.model}' to download it."
                ) from e
            raise RuntimeError(f"Ollama API returned HTTP error: {e}") from e
        except requests.RequestException as e:
            raise RuntimeError(f"Network error communicating with Ollama: {e}") from e

    def _stream_response(self, response: requests.Response) -> Generator[str, None, None]:
        """Stream chunks from Ollama /api/chat response."""
        for line in response.iter_lines():
            if line:
                try:
                    chunk = json.loads(line.decode("utf-8"))
                    content = chunk.get("message", {}).get("content", "")
                    if content:
                        yield content
                except json.JSONDecodeError:
                    continue


if __name__ == "__main__":
    client = GemmaClient()
    print("Checking Ollama status...")
    if not client.is_ollama_running():
        print(f"[ERROR] Ollama is not running at {client.host}")
        sys.exit(1)
    print(f"[OK] Ollama is running at {client.host}")

    models = client.list_models()
    print(f"Available local models: {models}")
    if client.is_model_available():
        print(f"[OK] Model '{client.model}' is available.")
    else:
        print(f"[WAIT] Model '{client.model}' is not yet available in {models}.")

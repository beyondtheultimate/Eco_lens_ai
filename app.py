"""
Main Application for Gemma 4 Hackathon Starter
MLH Hackathon Challenge: Best Use of Gemma 4
"""

import argparse
import sys
from gemma_client import GemmaClient

DEFAULT_SYSTEM_PROMPT = (
    "You are an intelligent, helpful, and concise AI hackathon assistant powered by Gemma. "
    "Provide clear, practical, and well-structured answers."
)


def run_single_prompt(client: GemmaClient, prompt: str, system_prompt: str = DEFAULT_SYSTEM_PROMPT):
    """Run a single prompt and print the response."""
    print(f"\n[Prompt]: {prompt}")
    print("[Gemma Response]: ", end="", flush=True)

    try:
        for chunk in client.chat(
            messages=[{"role": "user", "content": prompt}],
            stream=True,
            system_prompt=system_prompt,
        ):
            print(chunk, end="", flush=True)
        print("\n")
    except Exception as e:
        print(f"\n[ERROR] Failed to query Gemma: {e}", file=sys.stderr)


def run_interactive_chat(client: GemmaClient, system_prompt: str = DEFAULT_SYSTEM_PROMPT):
    """Run an interactive conversation loop."""
    print("=" * 60)
    print(" Gemma 4 Hackathon Assistant (Local Ollama)")
    print(f" Model: {client.model} | Host: {client.host}")
    print(" Type 'exit', 'quit', or press Ctrl+C to terminate.")
    print("=" * 60 + "\n")

    conversation = []

    while True:
        try:
            user_input = input("You > ").strip()
            if not user_input:
                continue
            if user_input.lower() in ("exit", "quit", "q"):
                print("Exiting Gemma assistant. Good luck with your hackathon!")
                break

            conversation.append({"role": "user", "content": user_input})
            print(f"\nGemma ({client.model}) > ", end="", flush=True)

            collected_response = []
            for chunk in client.chat(
                messages=conversation,
                stream=True,
                system_prompt=system_prompt,
            ):
                print(chunk, end="", flush=True)
                collected_response.append(chunk)
            print("\n")

            full_reply = "".join(collected_response)
            conversation.append({"role": "assistant", "content": full_reply})

        except KeyboardInterrupt:
            print("\nSession interrupted by user.")
            break
        except Exception as e:
            print(f"\n[ERROR] {e}\n", file=sys.stderr)


def main():
    parser = argparse.ArgumentParser(description="Gemma 4 Hackathon Application")
    parser.add_argument("--prompt", "-p", type=str, help="Single prompt to execute directly")
    parser.add_argument("--model", "-m", type=str, default="gemma4:e2b", help="Model tag (default: gemma4:e2b)")
    parser.add_argument("--host", type=str, default="http://localhost:11434", help="Ollama host URL")
    parser.add_argument("--system", "-s", type=str, default=DEFAULT_SYSTEM_PROMPT, help="Custom system prompt")
    parser.add_argument("--check-only", action="store_true", help="Only verify connection and model status")

    args = parser.parse_args()

    client = GemmaClient(host=args.host, model=args.model)

    print("Verifying Ollama environment...")
    if not client.is_ollama_running():
        print(f"[ERROR] Ollama is not reachable at {client.host}.")
        print("Please start Ollama service using 'ollama serve' or launch the Ollama desktop application.")
        sys.exit(1)

    print(f"[OK] Ollama is active at {client.host}")

    installed_models = client.list_models()
    print(f"[INFO] Installed models: {', '.join(installed_models) if installed_models else 'None'}")

    if not client.is_model_available():
        print(f"[WARNING] Model '{client.model}' was not found in local Ollama.")
        print(f"Run 'ollama pull {client.model}' in a terminal to download it.")
        if args.check_only or not args.prompt:
            sys.exit(2)

    if args.check_only:
        print("[OK] Environment verification successful!")
        sys.exit(0)

    if args.prompt:
        run_single_prompt(client, args.prompt, system_prompt=args.system)
    else:
        run_interactive_chat(client, system_prompt=args.system)


if __name__ == "__main__":
    main()

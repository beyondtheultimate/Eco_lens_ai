# Gemma 4 Hackathon Starter (`gemma4-hackathon`)

> **MLH Hackathon Challenge**: Best Use of Gemma 4  
> **Environment**: Windows 11 | Local Ollama (`gemma4:e2b`) | Python 3.13+ | VS Code & Antigravity Ready

---

## 🚀 Overview

This repository provides an autonomous, production-ready starter template for building AI-powered applications powered by **Gemma 4** running 100% locally on your machine via **Ollama**.

- **Zero Cloud Costs**: All inferences run locally on your hardware.
- **Privacy First**: No prompts or sensitive code are sent to external cloud APIs.
- **Low Latency & Fast Iteration**: Directly interfaces with Ollama's local chat API (`http://localhost:11434`).
- **Resilient Client**: Built-in health checks, streaming response support, model fallback detection, and modular architecture.

---

## 📦 Project Structure

```text
gemma4-hackathon/
│
├── .gitignore             # Excludes .venv, secrets, cache, and IDE configs
├── requirements.txt       # Python dependencies (requests, ollama, pytest)
├── gemma_client.py        # Robust client wrapper for Ollama local chat API
├── app.py                 # CLI & interactive chat application with streaming
├── test_gemma.py          # Pytest suite with mock and live integration tests
└── README.md              # Setup guide, architecture, and hackathon reference
```

---

## 🛠️ Prerequisites

1. **Operating System**: Windows 11 (or macOS / Linux)
2. **RAM**: Minimum 8 GB (16 GB recommended)
3. **Ollama**: Installed and running ([ollama.com](https://ollama.com))
4. **Python**: Python 3.10+ (Anaconda or standard CPython)
5. **VS Code** / **Google Antigravity**: For development and AI-assisted workflows

---

## ⚡ Quick Start

### 1. Start Ollama and Download Gemma 4

Ensure Ollama is running in the background, then pull the target model:

```powershell
# Verify Ollama service is active
ollama list

# Pull Gemma 4 model (recommended small, fast model for 16GB RAM)
ollama pull gemma4:e2b

# Quick test via CLI
ollama run gemma4:e2b "Hello Gemma!"
```

### 2. Activate Python Virtual Environment

```powershell
# In PowerShell (within project root):
.\.venv\Scripts\Activate.ps1

# Or run directly using the venv interpreter:
.\.venv\Scripts\python.exe app.py --check-only
```

### 3. Run the Application

#### Single Prompt Test
```powershell
.\.venv\Scripts\python.exe app.py --prompt "Suggest three innovative hackathon project ideas using local AI models."
```

#### Interactive Chat Loop
```powershell
.\.venv\Scripts\python.exe app.py
```

#### Custom System Prompt
```powershell
.\.venv\Scripts\python.exe app.py --system "You are an expert full-stack developer. Write code in clean markdown."
```

---

## 🧪 Testing

Run automated tests using `pytest`:

```powershell
.\.venv\Scripts\pytest.exe -v
```

All client unit tests run with mocked HTTP responses and do not depend on the network or model state.

---

## 💻 Developer Tooling Setup

### VS Code Integration

1. **Recommended Extension**: [Continue](https://marketplace.visualstudio.com/items?itemName=Continue.continue) (open-source AI code assistant).
2. **Ollama Configuration**: In Continue settings (`~/.continue/config.json`), configure Ollama provider:
   ```json
   {
     "models": [
       {
         "title": "Gemma 4 (Local)",
         "provider": "ollama",
         "model": "gemma4:e2b"
       }
     ]
   }
   ```
3. Use `Ctrl+I` to refactor/edit code inline and `Ctrl+L` to chat with your local Gemma model.

### Google Antigravity Integration

- Antigravity 2.0 / Antigravity IDE natively manages agent workflows, terminal sandboxes, and file edits.
- The project files are fully recognized and tracked by Antigravity.
- You can pair-program with the Antigravity agent in the chat canvas while running your local Gemma inference server side-by-side.

---

## 🛡️ Security & Privacy Guidelines

- Never commit `.env` files, API keys, or access tokens.
- Keep Ollama bound to `localhost:11434` for local security.
- Virtual environments (`.venv/`) are excluded in `.gitignore`.

---

## 🏆 Ideas for the MLH Hackathon Challenge

- **Local AI Code Reviewer**: Pre-commit hook that analyzes pull requests offline.
- **Private Document Intelligence**: Local retrieval-augmented generation (RAG) assistant for sensitive health/finance documents.
- **Embedded Voice / Device Assistant**: Ultra-lightweight conversational agent running on edge devices.
- **Autonomous Local Agent**: Multi-step task planner executing safe local tasks without cloud dependencies.

# Flow State - Quick Start

**A personal focus monitoring system that tracks browser activity and detects when you drift from your goals**

## Features

- 🎯 **Focus State Detection** - FOCUSED or DRIFTING states
- 🔔 **Smart Notifications** - macOS notifications when you drift
- 🔌 **Chrome Extension** - Seamless browser activity tracking
- 🤖 **Multiple LLM Providers** - Ollama (local) or AWS Bedrock

## Quick Start

```bash
# 1. Install
pip install --no-build-isolation --no-deps .

# 2. Run with your goal (server auto-starts)
flow-state --goal "Learn Python programming"
```

## Installation

### Prerequisites

- Python 3.8+
- Google Chrome
- Ollama (default) or AWS credentials (for Bedrock)

### Step 1: Install

```bash
git clone https://github.com/yourusername/flow-state.git
cd flow-state
pip install -r requirements.txt
pip install --no-build-isolation --no-deps .
```

### Step 2: Install Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `flow-state-chrome-extension/` folder

### Step 3: Configure LLM

Default config is created at `~/.flow-state/config.json` on first run (Ollama).

To use Bedrock, edit `~/.flow-state/config.json`:
```json
{
  "llm": {
    "provider": "bedrock",
    "model_id": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "region_name": "us-east-1"
  }
}
```

### Step 4: Run

```bash
flow-state --goal "Learn Python programming"
```

## Managing Your Goal

```bash
# View current goal
flow-state-goal

# Set new goal
flow-state-goal --set "Build a web application"
```

## Troubleshooting

- Extension not tracking: check `chrome://extensions/` and ensure server is running
- LLM errors: verify Ollama is running (`ollama serve`) or AWS credentials are valid
- No notifications: grant notification permissions to Terminal in macOS System Settings

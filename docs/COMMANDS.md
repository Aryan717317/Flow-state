# Command Reference

## Main Agent

```bash
# Run with goal (auto-starts server)
flow-state --goal "Learn Python programming"

# Run with existing goal
flow-state

# Custom config file
flow-state --config /path/to/config.json

# Don't auto-start server
flow-state --no-server

# Keep server running after agent stops
flow-state --keep-server

# Test notifications
flow-state --test-notification
```

## Goal Management

```bash
# View current goal
flow-state-goal

# Set new goal
flow-state-goal --set "Learn machine learning"
```

Output:
```
============================================================
Current Focus Goal
============================================================

🎯 Learn Python programming

State: FOCUSED
Confidence: 0.7
============================================================
```

## Server

```bash
# Start server manually
flow-state-server

# Custom host/port
flow-state-server --host 127.0.0.1 --port 3333
```

## Switching LLM Provider

Edit `~/.flow-state/config.json`:

**Ollama (local):**
```json
{
  "llm": {
    "provider": "ollama",
    "model": "qwen2.5:latest",
    "base_url": "http://localhost:11434"
  }
}
```

**AWS Bedrock:**
```json
{
  "llm": {
    "provider": "bedrock",
    "model_id": "anthropic.claude-3-5-sonnet-20240620-v1:0",
    "region_name": "us-east-1"
  }
}
```

## Typical Workflow

1. Set your goal and start:
   ```bash
   flow-state --goal "Learn Python programming"
   ```

2. Change goal:
   ```bash
   flow-state-goal --set "Build a web application"
   flow-state
   ```

3. Switch provider: edit `~/.flow-state/config.json` and restart.

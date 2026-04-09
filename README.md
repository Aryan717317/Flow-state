<div align="center">

<img src="assets/logo.png" alt="Flow State Logo" height="120" style="margin-bottom: 12px;"/>


# Flow State

**A smart, AI-powered focus monitoring system that tracks your browser activity and gently prevents you from drifting away from your goals.**

[![Python 3.8+](https://img.shields.io/badge/python-3.8+-blue.svg)](https://www.python.org/downloads/)
[![Windows](https://img.shields.io/badge/platform-Windows-blue.svg)](https://www.microsoft.com/windows/)
[![Chrome](https://img.shields.io/badge/browser-Chrome-green.svg)](https://www.google.com/chrome/)

</div>

---

## ⚡ What is Flow State?

Flow State transforms how you work by maintaining contexts. You declare what you want to achieve, and a background AI agent continuously analyzes your open tabs and active Chrome session state. If you start doomscrolling or fall down a rabbit hole, Flow State instantly catches on, calculates a confidence score, and gently nudges you back to reality.

Privacy is paramount—it can operate **entirely offline** via Ollama to guarantee your browsing data never leaves your device.

## 🚀 Quick Start

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   pip install .
   ```

2. **Load Chrome Extension**
   Open Chrome, navigate to `chrome://extensions/`, enable **Developer mode**, and click **Load unpacked**. Select the `flow-state-chrome-extension` folder located inside this repository.

3. **Set Your Intention**
   Drop into your terminal and launch the agent with your target goal:
   ```bash
   flow-state --goal "Research machine learning models for stock prediction"
   ```

4. **Dashboard View**
   Open `http://localhost:3333/dashboard` to see your real-time logging, focus state visualization, and tracking statistics.

---

## 🏗️ Architecture & Control Flow

How Flow State orchestrates Chrome events, AI reasoning, and notifications under the hood.

### 1. High-Level Pipeline
```mermaid
graph TD
    subgraph UI ["UI & CLI"]
        CLI[cli.py]
        DW["Flow State (Main)"]
        Dash[Dashboard JS]
    end

    subgraph Control ["State & Config"]
        SM[StateManager]
        Cfg[Config]
    end

    subgraph Processing ["Logic & AI"]
        Reason[LLM Reasoner]
        Base[Base LLM Client]
        Proc[Activity Processor]
    end

    subgraph Collection ["Tracking & Server"]
        Srv[Event Server]
        Ext[Chrome Extension]
    end

    %% Connections
    Ext -- "Sends JSON" --> Srv
    Srv -- "Provides logs" --> Proc
    Proc -- "Analyzed activity" --> DW
    DW -- "Consults" --> Reason
    Reason -- "Instantiates" --> Base
    DW -- "Loads" --> Cfg
    DW -- "Updates focus" --> SM
    Dash -- "Visualizes" --> SM

    %% Styling
    style SM fill:#f96,stroke:#333,stroke-width:2px
    style Srv fill:#f96,stroke:#333,stroke-width:2px
    style Base fill:#f96,stroke:#333,stroke-width:2px
```

### 2. AI Service Architecture
```mermaid
graph LR
    Base{{"BaseLLMClient (Abstract)"}}
    Bed[BedrockClient]
    Olla[OllamaClient]
    Reas[LLMReasoner]
    Assess[assess_focus_state]
    
    %% Relationships
    Reas -- "Uses" --> Base
    Base -- "Inherited by" --> Bed
    Base -- "Inherited by" --> Olla
    Reas -- "Triggers" --> Assess
    Assess -- "Calls" --> Bed
    Assess -- "Calls" --> Olla

    style Base fill:#b3e5fc,stroke:#01579b
    style Bed fill:#d1c4e9,stroke:#4527a0
    style Olla fill:#d1c4e9,stroke:#4527a0
```

### 3. State & Persistence Hub
```mermaid
graph TD
    SM[StateManager Class]
    Load[load_state]
    Save[save_state]
    Hist[load_history]
    Arch[archive_session]
    Reset[reset_logs]
    
    %% Relationships
    SM --> Load
    SM --> Save
    SM --> Hist
    SM --> Arch
    SM --> Reset

    style SM fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
```

### 4. The Event Lifeline (Data Ingestion)
```mermaid
graph LR
    subgraph Browser ["Chrome Extension"]
        BG[background.js]
        Cont[content.js]
        Interact[sendInteractionUpdate]
    end

    subgraph Application ["Tracking Server"]
        Srv[server.py]
        ER[EventReader]
        ML[Main Loop]
    end

    %% Flow
    Cont -- "Interaction detected" --> BG
    BG -- "POST /event" --> Srv
    Srv -- "Writes to local logs" --> ER
    ER -- "Reads events" --> ML

    style Srv fill:#ffe0b2,stroke:#ef6c00
    style ML fill:#ffe0b2,stroke:#ef6c00
```

---

## ⚙️ AI Providers

Flow State allows you to pick your AI processing methodology depending on how you prioritize cost vs quality vs privacy. Modify these settings in `~/.flow-state/config.json` after running the application for the first time.

- **Ollama**: Default configuration. Free, completely private, and runs entirely on-device (We recommend `qwen2.5` or `llama3`). 
- **AWS Bedrock**: Ultra-fast and highly accurate cloud processing via Claude 3.5 Sonnet. Requires standard AWS credentials setup in your local environment.

## 📄 License

MIT. See `LICENSE` for details.

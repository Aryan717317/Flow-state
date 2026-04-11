import json
from .base import BaseLLMClient


class LLMReasoner:
    """Handles LLM-based reasoning for focus state assessment."""

    FOCUS_ASSESSMENT_PROMPT = """You are Flow State, a personal focus monitoring system.

Goal: "{goal}"

Recent browser activity:
{pages}

For each page, decide if it is relevant to the goal.
Then give an overall FOCUSED or DRIFTING state based on time-weighted relevance.

Rules:
- FOCUSED: Most time spent on content directly related to the goal
- DRIFTING: Most time spent on unrelated content
- **Crucial**: Programming tools, LLM research, documentation (like GeeksforGeeks, StackOverflow, ChatGPT) SHOULD be considered FOCUSED if the goal involves coding, building software, or researching technology.
- Entertainment (unrelated videos, social media, news) = irrelevant
- When in doubt about relevance, lean towards FOCUSED if it looks like technical research.

Return JSON only:
{{
  "state": "FOCUSED" or "DRIFTING",
  "confidence": <float from 0.0 to 1.0 representing how sure you are, e.g. 0.95>,
  "reason": "brief explanation",
  "relevant_percent": <float 0-100>,
  "irrelevant_percent": <float 0-100>
}}"""

    def __init__(self, client: BaseLLMClient):
        if client is None:
            raise ValueError("LLM client is required")
        self.client = client

    def assess_focus_state(self, goal: str, activity_summary: dict) -> dict:
        """Single LLM call to assess focus state and relevance breakdown."""
        pages = activity_summary.get("pages", [])
        pages_text = "\n".join(
            f"- [{p['duration_min']}min] {p['title']} ({p['url']})"
            + (f"\n  Content: {p['content'][:150]}" if p.get("content") else "")
            for p in pages
        )

        prompt = self.FOCUS_ASSESSMENT_PROMPT.format(
            goal=goal,
            pages=pages_text or "No pages visited"
        )

        result = self.client.invoke(prompt, max_tokens=500)

        # Ensure required fields exist
        result.setdefault("state", "FOCUSED")
        result.setdefault("confidence", 0.5)
        result.setdefault("reason", "")
        result.setdefault("relevant_percent", 0.0)
        result.setdefault("irrelevant_percent", 0.0)

        return result

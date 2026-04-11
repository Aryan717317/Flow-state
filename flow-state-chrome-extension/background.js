let activeTabId = null;
let sessionStart = null;
let interactionBuffer = {};
let contentBuffer = {};
let eventsSentCount = 0;

function sendEvent(event) {
  fetch("http://localhost:3333/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  }).then(() => {
    eventsSentCount++;
    console.log("[FlowState] Event sent (#" + eventsSentCount + "):", event.type, event.title || "");
  }).catch(err => {
    console.warn("[FlowState] Server not reachable:", err.message);
  });
}

function endCurrentSession() {
  if (!activeTabId || !sessionStart) return;
  
  chrome.tabs.get(activeTabId, tab => {
    if (chrome.runtime.lastError) return;
    
    sendEvent({
      type: "PAGE_SESSION",
      title: tab.title,
      url: tab.url,
      content: contentBuffer[activeTabId] || "",
      durationMs: Date.now() - sessionStart,
      scrollCount: interactionBuffer[activeTabId]?.scroll || 0,
      keyCount: interactionBuffer[activeTabId]?.key || 0,
      timestamp: Date.now()
    });
  });
}

// Track tab activation
chrome.tabs.onActivated.addListener(({ tabId }) => {
  endCurrentSession();
  
  activeTabId = tabId;
  sessionStart = Date.now();
});

// Handle messages from content script AND popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_EVENT_COUNT") {
    sendResponse({ count: eventsSentCount });
    return true;
  }
  
  if (msg.type === "INTERACTION_UPDATE") {
    interactionBuffer[activeTabId] = {
      scroll: msg.scrollCount,
      key: msg.keyCount
    };
    
    if (msg.content) {
      contentBuffer[activeTabId] = msg.content;
    }
  } else if (msg.type === "URL_CHANGED") {
    endCurrentSession();
    sessionStart = Date.now();
    
    interactionBuffer[activeTabId] = {
      scroll: 0,
      key: 0
    };
    
    if (msg.content) {
      contentBuffer[activeTabId] = msg.content;
    }
  }
});

// Track tab close
chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId && sessionStart) {
    sendEvent({
      type: "PAGE_SESSION",
      content: contentBuffer[tabId] || "",
      durationMs: Date.now() - sessionStart,
      timestamp: Date.now()
    });
    
    delete interactionBuffer[tabId];
    delete contentBuffer[tabId];
    activeTabId = null;
    sessionStart = null;
  }
});

// ─── HEARTBEAT: Send a snapshot of the current tab every 10 seconds ───
setInterval(() => {
  if (!activeTabId || !sessionStart) return;
  
  chrome.tabs.get(activeTabId, tab => {
    if (chrome.runtime.lastError || !tab) return;
    
    sendEvent({
      type: "PAGE_SESSION",
      title: tab.title,
      url: tab.url,
      content: contentBuffer[activeTabId] || "",
      durationMs: Date.now() - sessionStart,
      scrollCount: interactionBuffer[activeTabId]?.scroll || 0,
      keyCount: interactionBuffer[activeTabId]?.key || 0,
      timestamp: Date.now()
    });
  });
}, 10000);

// Initialize: capture whatever tab is active on startup
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs.length > 0) {
    activeTabId = tabs[0].id;
    sessionStart = Date.now();
    console.log("[FlowState] Extension initialized, tracking tab:", tabs[0].title);
  }
});

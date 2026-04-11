// Check server connection
async function checkServer() {
  const dot = document.getElementById('statusDot');
  const status = document.getElementById('serverStatus');
  try {
    const res = await fetch('http://localhost:3333/health', { signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      dot.className = 'status-dot connected';
      status.textContent = '● Connected (port 3333)';
      status.className = 'value green';
    } else {
      throw new Error('bad response');
    }
  } catch {
    dot.className = 'status-dot disconnected';
    status.textContent = '● Disconnected';
    status.className = 'value red';
  }
}

// Show current tab
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  const el = document.getElementById('currentTab');
  if (tabs.length > 0) {
    const title = tabs[0].title || 'Unknown';
    el.textContent = title.length > 40 ? title.substring(0, 40) + '…' : title;
  } else {
    el.textContent = 'No active tab';
  }
});

// Get event count from background
chrome.runtime.sendMessage({ type: 'GET_EVENT_COUNT' }, response => {
  const el = document.getElementById('eventCount');
  if (response && response.count !== undefined) {
    el.textContent = response.count;
  } else {
    el.textContent = '0';
  }
});

// Dashboard button
document.getElementById('dashBtn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:3333/dashboard' });
  window.close();
});

// Run checks
checkServer();

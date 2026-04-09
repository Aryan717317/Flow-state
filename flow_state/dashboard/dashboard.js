/* ============================================================
   Flow State Dashboard — Monotonic Minimal Logic
   ============================================================ */

const STATE_INFO = {
    'FOCUSED': 'Working on or learning about your goal',
    'DRIFTING': 'Off-topic or distracted from your goal'
};

let currentView = 'live';
let sessionsData = [];

/* --- Sidebar Toggle --- */
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('main-content');
    const toggle = document.getElementById('sidebar-toggle');

    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    toggle.classList.toggle('collapsed');
}

/* --- Theme Toggle --- */
function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    const moonIcon = document.querySelector('.moon-icon');
    const sunIcon = document.querySelector('.sun-icon');
    if (newTheme === 'light') {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'block';
    } else {
        moonIcon.style.display = 'block';
        sunIcon.style.display = 'none';
    }
}

// Restore saved theme
const savedTheme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', savedTheme);
if (savedTheme === 'light') {
    document.addEventListener('DOMContentLoaded', () => {
        const moon = document.querySelector('.moon-icon');
        const sun = document.querySelector('.sun-icon');
        if (moon) moon.style.display = 'none';
        if (sun) sun.style.display = 'block';
    });
}

/* --- Helpers --- */
function formatDate(timestamp) {
    const date = new Date(timestamp * 1000);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

/* --- History Loading --- */
async function loadHistory() {
    try {
        const response = await fetch('/api/history');
        if (!response.ok) throw new Error('Failed to load history');
        const data = await response.json();
        sessionsData = data.sessions || [];
        renderHistory();
    } catch (error) {
        document.getElementById('sidebar-content').innerHTML = `
            <div style="padding: 1rem; color: var(--text-muted); text-align: left; font-size: 13px;">
                No history
            </div>
        `;
    }
}

function renderHistory() {
    if (sessionsData.length === 0) {
        document.getElementById('sidebar-content').innerHTML = `
            <div style="padding: 1rem; color: var(--text-muted); text-align: left; font-size: 13px;">
                No sessions yet
            </div>
        `;
        return;
    }

    const grouped = {};
    sessionsData.forEach((session, index) => {
        const dateKey = formatDate(session.end_ts);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push({ ...session, index });
    });

    let html = '';
    Object.entries(grouped).forEach(([date, sessions]) => {
        html += `
            <div class="session-group">
                <div class="session-date">${date}</div>
                ${sessions.map(session => `
                    <div class="session-item ${currentView === session.index ? 'active' : ''}"
                         onclick="viewSession(${session.index})">
                        <div class="session-goal">${session.goal}</div>
                        <div class="session-meta">
                            <span class="session-duration">${formatDuration(session.end_ts - session.start_ts)}</span>
                            <span style="color: var(--border);">/</span>
                            <span class="session-drifts">${session.drift_count} drifts</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    });

    document.getElementById('sidebar-content').innerHTML = html;
}

/* --- Session Viewing --- */
function viewSession(index) {
    currentView = index;
    renderHistory();
    renderSessionStats(sessionsData[index]);
}

function viewLive() {
    currentView = 'live';
    renderHistory();
    loadDashboard();
}

function renderSessionStats(session) {
    const duration = session.end_ts - session.start_ts;
    const stateClass = `state-${session.final_state.toLowerCase()}`;
    const stateIcon = session.final_state === 'FOCUSED' ? '●' : '○';

    document.getElementById('dashboard').innerHTML = `
        <div class="cards">
            <div class="card goal-card">
                <div class="card-title">Past Session</div>
                <div class="goal-text">
                    <span>${session.goal}</span>
                    <button class="back-to-live-btn" onclick="viewLive()">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="15 18 9 12 15 6"/>
                        </svg>
                        Back
                    </button>
                </div>
                <div style="display:flex; align-items:center; gap: 8px;">
                    <span class="state-badge ${stateClass}">
                        ${stateIcon} ${session.final_state}
                    </span>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Final Confidence</div>
                <div class="card-value">${Math.round(session.final_confidence * 100)}%</div>
                <div class="card-subtitle">End of session</div>
            </div>

            <div class="card">
                <div class="card-title">Drifts</div>
                <div class="card-value">${session.drift_count}</div>
                <div class="card-subtitle">Times drifted</div>
            </div>

            <div class="card">
                <div class="card-title">Duration</div>
                <div class="card-value">${formatDuration(duration)}</div>
                <div class="card-subtitle">Focus time</div>
            </div>

            <div class="card">
                <div class="card-title">Ended</div>
                <div class="card-value">${formatDate(session.end_ts)}</div>
                <div class="card-subtitle">${new Date(session.end_ts * 1000).toLocaleTimeString()}</div>
            </div>
        </div>
    `;
}

/* --- Live Dashboard --- */
async function loadDashboard() {
    const dashboard = document.getElementById('dashboard');

    try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error('API unreachable');
        const data = await response.json();
        renderDashboard(data);
    } catch (error) {
        dashboard.innerHTML = `
            <div class="error">
                Server not running.<br>
                Run <code style="font-family: 'JetBrains Mono', monospace; background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; margin-left: 4px; border: 1px solid var(--border);">flow-state-server</code> to start.
            </div>
        `;
    }
}

function renderDashboard(data) {
    const stateClass = `state-${data.focus_state.toLowerCase()}`;
    const stateIcon = data.focus_state === 'FOCUSED' ? '●' : '○';
    const stateInfo = STATE_INFO[data.focus_state] || 'Unknown';

    const relevantPct = Math.round(data.relevant_percent || 0);
    const irrelevantPct = Math.round(data.irrelevant_percent || 0);
    const hasBreakdown = relevantPct + irrelevantPct > 0;

    const breakdownHTML = hasBreakdown ? `
        <div class="activity-item">
            <span class="activity-label">Relevant</span>
            <div class="activity-bar">
                <div class="activity-fill relevant" style="width: ${relevantPct}%"></div>
            </div>
            <span class="activity-percent">${relevantPct}%</span>
        </div>
        <div class="activity-item">
            <span class="activity-label">Irrelevant</span>
            <div class="activity-bar">
                <div class="activity-fill irrelevant" style="width: ${irrelevantPct}%"></div>
            </div>
            <span class="activity-percent">${irrelevantPct}%</span>
        </div>
    ` : '';

    document.getElementById('dashboard').innerHTML = `
        <div class="cards">
            <div class="card goal-card">
                <div class="card-title">Current Goal</div>
                <div class="goal-text">
                    <span>${data.goal}</span>
                    <span class="live-badge">
                        <span class="live-dot"></span>
                        LIVE
                    </span>
                </div>
                <div style="display:flex; align-items:center; gap: 8px;">
                    <span class="state-badge ${stateClass}">
                        ${stateIcon} ${data.focus_state}
                    </span>
                    <div class="tooltip">
                        <svg class="info-icon" viewBox="0 0 24 24" fill="none" stroke-width="1.5">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        <span class="tooltiptext">${stateInfo}</span>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-title">Confidence</div>
                <div class="card-value">${Math.round(data.confidence * 100)}%</div>
                <div class="card-subtitle">Current state confidence</div>
            </div>

            <div class="card">
                <div class="card-title">Drifts</div>
                <div class="card-value">${data.drift_count}</div>
                <div class="card-subtitle">Times drifted today</div>
            </div>

            <div class="card">
                <div class="card-title">Time</div>
                <div class="card-value">${data.session_minutes}m</div>
                <div class="card-subtitle">Active tracking</div>
            </div>

            <div class="card">
                <div class="card-title">Updated</div>
                <div class="card-value">${data.last_check}</div>
                <div class="card-subtitle">Time since last check</div>
            </div>

            ${hasBreakdown ? `
            <div class="card" style="grid-column: 1 / -1;">
                <div class="card-title">Activity</div>
                <div>
                    ${breakdownHTML}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

/* --- Auto-refresh (live view only) --- */
setInterval(() => {
    if (currentView === 'live') loadDashboard();
}, 30000);

/* --- Initial Load --- */
loadHistory();
loadDashboard();

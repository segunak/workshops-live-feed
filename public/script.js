/**
 * Live Feed - JavaScript
 * Handles tab switching, live mode toggle, and feed refresh
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Tab switching for code examples
    const tabBtns = document.querySelectorAll('.tab-btn');
    const codePanels = document.querySelectorAll('.code-panel');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;
            
            // Update active states
            tabBtns.forEach(b => b.classList.remove('active'));
            codePanels.forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Live mode toggle
    const liveToggle = document.getElementById('liveToggle');
    const statusText = document.getElementById('statusText');
    const refreshBtn = document.getElementById('refreshBtn');
    const feedFrame = document.getElementById('feedFrame');
    
    let isLive = false;
    let refreshInterval = null;
    const REFRESH_INTERVAL_MS = 30000; // 30 seconds

    function refreshFeed() {
        if (!feedFrame) return;
        const baseSrc = feedFrame.src.split('?')[0];
        const cacheBust = 'cb=' + Date.now();
        feedFrame.src = baseSrc + '?viewControls=on&' + cacheBust;
    }

    function startLiveMode() {
        isLive = true;
        liveToggle.classList.add('active');
        statusText.textContent = 'Auto-refresh every 30s';
        refreshInterval = setInterval(refreshFeed, REFRESH_INTERVAL_MS);
    }

    function stopLiveMode() {
        isLive = false;
        liveToggle.classList.remove('active');
        statusText.textContent = 'Auto-refresh off';
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
    }

    if (liveToggle) {
        liveToggle.addEventListener('click', () => {
            if (isLive) {
                stopLiveMode();
            } else {
                startLiveMode();
            }
        });
    }

    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshFeed);
    }

    // Pause refresh when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isLive) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        } else if (!document.hidden && isLive) {
            refreshInterval = setInterval(refreshFeed, REFRESH_INTERVAL_MS);
        }
    });
});

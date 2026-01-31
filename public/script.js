/**
 * Live Feed - JavaScript
 * Handles tab switching, live mode toggle, and feed refresh
 */

document.addEventListener('DOMContentLoaded', function() {
    // ========================================
    // Scroll Lock: Prevent Airtable iframe cookie popup from stealing focus
    // The OneTrust cookie banner inside Airtable embeds has tabindex="0" 
    // and auto-focuses, which scrolls the page to the iframe location.
    // We lock scroll until iframes load, then release shortly after.
    // ========================================
    
    let scrollLocked = true;
    const feedFrame = document.getElementById('feedFrame');
    const uiFeedFrame = document.getElementById('uiFeedFrame');
    let framesLoaded = 0;
    
    function releaseScrollLock() {
        if (!scrollLocked) return;
        scrollLocked = false;
        window.removeEventListener('scroll', preventScroll);
    }
    
    function onFrameLoad() {
        framesLoaded++;
        // Both iframes loaded - release lock after brief delay for cookie popup to settle
        if (framesLoaded >= 2) {
            setTimeout(releaseScrollLock, 500);
        }
    }
    
    // Listen for iframe load events
    if (feedFrame) feedFrame.addEventListener('load', onFrameLoad);
    if (uiFeedFrame) uiFeedFrame.addEventListener('load', onFrameLoad);
    
    // Lock scroll position using requestAnimationFrame
    function lockScroll() {
        if (scrollLocked) {
            window.scrollTo(0, 0);
            requestAnimationFrame(lockScroll);
        }
    }
    requestAnimationFrame(lockScroll);
    
    // Catch scroll events and reset
    function preventScroll() {
        if (scrollLocked) {
            window.scrollTo(0, 0);
        }
    }
    window.addEventListener('scroll', preventScroll, { passive: false });
    
    // Fallback: release after 3 seconds max (in case load events don't fire)
    setTimeout(releaseScrollLock, 3000);

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
    const countdownText = document.getElementById('countdownText');
    const refreshBtn = document.getElementById('refreshBtn');
    // feedFrame and uiFeedFrame already declared above for scroll lock
    
    let isLive = false;
    let refreshInterval = null;
    let countdownInterval = null;
    let secondsRemaining = 0;
    const REFRESH_INTERVAL_MS = 30000; // 30 seconds
    const REFRESH_INTERVAL_S = 30;

    function refreshFrame(frame) {
        if (!frame) return;
        const baseSrc = frame.src.split('?')[0];
        const cacheBust = 'cb=' + Date.now();
        frame.src = baseSrc + '?viewControls=on&' + cacheBust;
    }

    function refreshFeed() {
        refreshFrame(feedFrame);
        refreshFrame(uiFeedFrame);
        secondsRemaining = REFRESH_INTERVAL_S;
    }

    function updateCountdown() {
        if (secondsRemaining > 0) {
            secondsRemaining--;
            countdownText.textContent = `(${secondsRemaining}s)`;
        }
    }

    function startLiveMode() {
        isLive = true;
        liveToggle.classList.add('active');
        statusText.textContent = 'Next refresh in';
        secondsRemaining = REFRESH_INTERVAL_S;
        countdownText.textContent = `(${secondsRemaining}s)`;
        refreshInterval = setInterval(refreshFeed, REFRESH_INTERVAL_MS);
        countdownInterval = setInterval(updateCountdown, 1000);
    }

    function stopLiveMode() {
        isLive = false;
        liveToggle.classList.remove('active');
        statusText.textContent = 'Auto-refresh off';
        countdownText.textContent = '';
        if (refreshInterval) {
            clearInterval(refreshInterval);
            refreshInterval = null;
        }
        if (countdownInterval) {
            clearInterval(countdownInterval);
            countdownInterval = null;
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
            clearInterval(countdownInterval);
            refreshInterval = null;
            countdownInterval = null;
        } else if (!document.hidden && isLive) {
            secondsRemaining = REFRESH_INTERVAL_S;
            countdownText.textContent = `(${secondsRemaining}s)`;
            refreshInterval = setInterval(refreshFeed, REFRESH_INTERVAL_MS);
            countdownInterval = setInterval(updateCountdown, 1000);
        }
    });
});

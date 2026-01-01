/**
 * TIDE - Settings Popup Script
 */

document.addEventListener('DOMContentLoaded', async () => {
    // Load current settings
    await loadSettings();
    await loadStatistics();

    // Attach event listeners
    document.getElementById('btn-save').addEventListener('click', saveSettings);
    document.getElementById('btn-export').addEventListener('click', exportJournal);
    document.getElementById('btn-reset').addEventListener('click', resetData);
});

/**
 * Load settings from storage
 */
async function loadSettings() {
    const { tideData } = await chrome.storage.local.get('tideData');

    if (!tideData) return;

    const settings = tideData.settings;

    // Trade limits
    document.getElementById('max-trades').value = settings.maxTradesPerDay;

    // Morning window
    document.getElementById('morning-enabled').checked = settings.tradingWindows.morning.enabled;
    document.getElementById('morning-start').value = settings.tradingWindows.morning.start;
    document.getElementById('morning-end').value = settings.tradingWindows.morning.end;

    // Evening window
    document.getElementById('evening-enabled').checked = settings.tradingWindows.evening.enabled;
    document.getElementById('evening-start').value = settings.tradingWindows.evening.start;
    document.getElementById('evening-end').value = settings.tradingWindows.evening.end;

    // Notifications
    document.getElementById('sound-alerts').checked = settings.soundAlerts;
}

/**
 * Load statistics
 */
async function loadStatistics() {
    const { tideData } = await chrome.storage.local.get('tideData');

    if (!tideData) return;

    // Calculate fresh statistics
    const stats = await calculateStats(tideData);

    document.getElementById('stat-total-trades').textContent = stats.totalTrades;
    document.getElementById('stat-win-rate').textContent = `${(stats.winRate * 100).toFixed(0)}%`;
    document.getElementById('stat-avg-return').textContent = `${(stats.avgReturn * 100).toFixed(1)}%`;
    document.getElementById('stat-discipline').textContent = `${(stats.disciplineScore * 100).toFixed(0)}%`;
}

/**
 * Calculate statistics from journal
 */
async function calculateStats(data) {
    const trades = data.journal.filter(e => e.type === 'trade' && e.outcome);

    if (trades.length === 0) {
        return {
            totalTrades: 0,
            winRate: 0,
            avgReturn: 0,
            disciplineScore: 1.0
        };
    }

    // Win rate
    const wins = trades.filter(t => t.outcome.result === 'win').length;
    const winRate = wins / trades.length;

    // Average return
    const totalPnL = trades.reduce((sum, t) => sum + (t.outcome.pnl || 0), 0);
    const avgReturn = totalPnL / trades.length;

    // Discipline score
    const validTrades = data.journal.filter(e => e.type === 'trade').length;
    const skippedSetups = data.journal.filter(e => e.type === 'skip').length;
    const disciplineScore = validTrades > 0
        ? 1 - (skippedSetups / (validTrades + skippedSetups))
        : 1.0;

    return {
        totalTrades: trades.length,
        winRate,
        avgReturn,
        disciplineScore
    };
}

/**
 * Save settings
 */
async function saveSettings() {
    const { tideData } = await chrome.storage.local.get('tideData');

    if (!tideData) return;

    // Update settings
    tideData.settings.maxTradesPerDay = parseInt(document.getElementById('max-trades').value);

    tideData.settings.tradingWindows.morning.enabled = document.getElementById('morning-enabled').checked;
    tideData.settings.tradingWindows.morning.start = document.getElementById('morning-start').value;
    tideData.settings.tradingWindows.morning.end = document.getElementById('morning-end').value;

    tideData.settings.tradingWindows.evening.enabled = document.getElementById('evening-enabled').checked;
    tideData.settings.tradingWindows.evening.start = document.getElementById('evening-start').value;
    tideData.settings.tradingWindows.evening.end = document.getElementById('evening-end').value;

    tideData.settings.soundAlerts = document.getElementById('sound-alerts').checked;

    // Save to storage
    await chrome.storage.local.set({ tideData });

    // Show success message
    const msg = document.getElementById('success-message');
    msg.style.display = 'block';
    setTimeout(() => {
        msg.style.display = 'none';
    }, 3000);
}

/**
 * Export journal
 */
async function exportJournal() {
    const { tideData } = await chrome.storage.local.get('tideData');

    if (!tideData) return;

    const entries = tideData.journal;

    // CSV header
    let csv = 'Date,Time,Type,Symbol,Action,RSI,Pattern,Entry Reason,Outcome,P&L,Lessons\n';

    // Add rows
    entries.forEach(entry => {
        const content = entry.content || {};
        const outcome = entry.outcome || {};

        csv += [
            entry.date,
            entry.time,
            entry.type,
            content.symbol || '',
            content.action || '',
            content.rsiValue || '',
            content.emaPattern || '',
            `"${(content.entryReason || content.reason || content.note || '').replace(/"/g, '""')}"`,
            outcome.result || '',
            outcome.pnl || '',
            `"${(outcome.lessons || '').replace(/"/g, '""')}"`
        ].join(',') + '\n';
    });

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIDE-Journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    alert('Journal exported successfully!');
}

/**
 * Reset all data
 */
async function resetData() {
    const confirmed = confirm(
        'WARNING: This will delete ALL your journal entries, trades, and statistics.\n\n' +
        'Are you absolutely sure?\n\n' +
        'This action CANNOT be undone!'
    );

    if (!confirmed) return;

    const doubleConfirm = confirm('Final confirmation: Delete everything?');

    if (!doubleConfirm) return;

    await chrome.storage.local.remove('tideData');

    alert('🔄 All data has been reset. Please reload the page.');

    // Reload settings
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

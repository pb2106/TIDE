/**
 * TIDE - Storage Manager
 * Centralized chrome.storage.local wrapper for all data operations
 */

const StorageManager = {
    /**
     * Get the entire TIDE data object
     */
    async getData() {
        const { tideData } = await chrome.storage.local.get('tideData');
        return tideData || null;
    },

    /**
     * Save the entire TIDE data object
     */
    async saveData(data) {
        await chrome.storage.local.set({ tideData: data });
    },

    /**
     * Get today's session, reset if new day
     */
    async getDailySession() {
        const data = await this.getData();
        const today = new Date().toISOString().split('T')[0];

        if (data.currentSession.date !== today) {
            // Trigger reset via background script
            await chrome.runtime.sendMessage({ action: 'checkReset' });
            // Re-fetch data after reset
            return (await this.getData()).currentSession;
        }

        return data.currentSession;
    },

    /**
     * Increment trade count and add trade entry
     */
    async incrementTradeCount(tradeDetails) {
        const data = await this.getData();
        const session = data.currentSession;

        // Validate trade limit
        if (session.tradesCount >= data.settings.maxTradesPerDay) {
            throw new Error('Maximum trades per day reached');
        }

        // Add trade
        const trade = {
            id: this.generateUUID(),
            timestamp: Date.now(),
            ...tradeDetails
        };

        session.trades.push(trade);
        session.tradesCount++;

        await this.saveData(data);

        return {
            success: true,
            tradesRemaining: data.settings.maxTradesPerDay - session.tradesCount,
            trade
        };
    },

    /**
     * Add a skipped setup entry
     */
    async addSkippedSetup(skipDetails) {
        const data = await this.getData();

        const skip = {
            timestamp: Date.now(),
            ...skipDetails
        };

        data.currentSession.skippedSetups.push(skip);
        await this.saveData(data);

        return { success: true };
    },

    /**
     * Add journal entry (manual note or other)
     */
    async addJournalEntry(entryDetails) {
        const data = await this.getData();

        const entry = {
            id: this.generateUUID(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-IN'),
            ...entryDetails
        };

        data.journal.unshift(entry); // Add to beginning

        // Keep only last 500 entries
        if (data.journal.length > 500) {
            data.journal = data.journal.slice(0, 500);
        }

        await this.saveData(data);
        return entry;
    },

    /**
     * Update journal entry with outcome
     */
    async updateJournalEntry(entryId, outcome) {
        const data = await this.getData();
        const entry = data.journal.find(e => e.id === entryId);

        if (entry) {
            entry.outcome = outcome;
            await this.saveData(data);
            return { success: true };
        }

        return { success: false, error: 'Entry not found' };
    },

    /**
     * Get journal entries with optional filtering
     */
    async getJournalEntries(filters = {}) {
        const data = await this.getData();
        let entries = [...data.journal];

        // Filter by date
        if (filters.date) {
            entries = entries.filter(e => e.date === filters.date);
        }

        // Filter by type
        if (filters.type) {
            entries = entries.filter(e => e.type === filters.type);
        }

        // Filter by symbol
        if (filters.symbol) {
            entries = entries.filter(e =>
                e.content && e.content.symbol === filters.symbol
            );
        }

        return entries;
    },

    /**
     * Export journal to CSV format
     */
    async exportJournal() {
        const data = await this.getData();
        const entries = data.journal;

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
                content.rsi || '',
                content.pattern || '',
                `"${(content.entryReason || '').replace(/"/g, '""')}"`,
                outcome.result || '',
                outcome.pnl || '',
                `"${(outcome.lessons || '').replace(/"/g, '""')}"`
            ].join(',') + '\n';
        });

        return csv;
    },

    /**
     * Get/update settings
     */
    async getSettings() {
        const data = await this.getData();
        return data.settings;
    },

    async updateSettings(newSettings) {
        const data = await this.getData();
        data.settings = { ...data.settings, ...newSettings };
        await this.saveData(data);
        return data.settings;
    },

    /**
     * Calculate statistics from journal
     */
    async calculateStatistics() {
        const data = await this.getData();
        const trades = data.journal.filter(e => e.type === 'trade' && e.outcome);

        if (trades.length === 0) {
            return data.statistics;
        }

        // Calculate win rate
        const wins = trades.filter(t => t.outcome.result === 'win').length;
        const winRate = wins / trades.length;

        // Calculate average return
        const totalPnL = trades.reduce((sum, t) => sum + (t.outcome.pnl || 0), 0);
        const avgReturn = totalPnL / trades.length;

        // Find best/worst patterns
        const patternStats = {};
        trades.forEach(t => {
            const pattern = t.content.pattern;
            if (!patternStats[pattern]) {
                patternStats[pattern] = { wins: 0, total: 0 };
            }
            patternStats[pattern].total++;
            if (t.outcome.result === 'win') patternStats[pattern].wins++;
        });

        let bestPattern = null;
        let worstPattern = null;
        let bestWinRate = 0;
        let worstWinRate = 1;

        Object.entries(patternStats).forEach(([pattern, stats]) => {
            const rate = stats.wins / stats.total;
            if (rate > bestWinRate) {
                bestWinRate = rate;
                bestPattern = pattern;
            }
            if (rate < worstWinRate) {
                worstWinRate = rate;
                worstPattern = pattern;
            }
        });

        // Calculate discipline score (% of rules followed)
        const validTrades = data.journal.filter(e => e.type === 'trade').length;
        const skippedSetups = data.journal.filter(e => e.type === 'skip').length;
        const disciplineScore = validTrades > 0
            ? 1 - (skippedSetups / (validTrades + skippedSetups))
            : 1.0;

        const stats = {
            totalTrades: trades.length,
            winRate,
            avgReturn,
            bestPattern,
            worstPattern,
            mostTradedTime: null, // TODO: Calculate from timestamps
            disciplineScore
        };

        data.statistics = stats;
        await this.saveData(data);

        return stats;
    },

    /**
     * Reset all data (confirm before calling)
     */
    async resetAllData() {
        await chrome.storage.local.remove('tideData');
        // Will be re-initialized by background script
    },

    /**
     * Generate UUID v4
     */
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
};

// Make available globally for content script
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
}

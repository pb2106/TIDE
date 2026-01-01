/**
 * TIDE - Journal Manager
 * Handles journal entry operations and formatting
 */

const JournalManager = {
    /**
     * Create a trade entry object
     */
    createTradeEntry(details) {
        return {
            symbol: details.symbol || '',
            action: details.action || '', // BUY or SELL
            entryReason: details.entryReason || '',
            emaPattern: details.emaPattern || '',
            emaValues: details.emaValues || {},
            rsiValue: details.rsiValue || null,
            outcome: null
        };
    },

    /**
     * Create a skipped setup entry
     */
    createSkipEntry(details) {
        return {
            symbol: details.symbol || '',
            reason: details.reason || ''
        };
    },

    /**
     * Create a manual note entry
     */
    createNoteEntry(note) {
        return {
            type: 'note',
            content: {
                note: note
            }
        };
    },

    /**
     * Format entry for display
     */
    formatEntryForDisplay(entry) {
        const date = new Date(entry.date);
        const dateStr = this.formatDate(date);
        const timeStr = entry.time;

        let title = '';
        let subtitle = '';
        let icon = '📌';

        switch (entry.type) {
            case 'trade':
                icon = entry.content.action === 'BUY' ? '[BUY]' : '[SELL]';
                title = `${entry.content.symbol} - ${entry.content.action}`;
                subtitle = entry.content.entryReason;
                break;
            case 'skip':
                icon = '[SKIP]';
                title = `${entry.content.symbol} - SKIPPED`;
                subtitle = entry.content.reason;
                break;
            case 'note':
                icon = '[NOTE]';
                title = 'Manual Note';
                subtitle = entry.content.note;
                break;
            case 'summary':
                icon = '[SUMMARY]';
                title = 'Daily Summary';
                subtitle = entry.content.summary;
                break;
            default:
                title = 'Unknown Entry';
        }

        return {
            id: entry.id,
            icon,
            title,
            subtitle,
            dateStr,
            timeStr,
            type: entry.type,
            hasOutcome: entry.outcome !== null && entry.outcome !== undefined
        };
    },

    /**
     * Format date for display
     */
    formatDate(date) {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (this.isSameDay(date, today)) {
            return 'Today';
        } else if (this.isSameDay(date, yesterday)) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-IN', {
                month: 'short',
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    },

    /**
     * Check if two dates are the same day
     */
    isSameDay(date1, date2) {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate();
    },

    /**
     * Group entries by date
     */
    groupByDate(entries) {
        const grouped = {};

        entries.forEach(entry => {
            const date = entry.date;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(entry);
        });

        return grouped;
    },

    /**
     * Get recent entries (last N)
     */
    getRecent(entries, count = 5) {
        return entries.slice(0, count);
    },

    /**
     * Search entries by text
     */
    searchEntries(entries, query) {
        const lowerQuery = query.toLowerCase();

        return entries.filter(entry => {
            // Search in symbol
            if (entry.content.symbol &&
                entry.content.symbol.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            // Search in notes/reasons
            if (entry.content.entryReason &&
                entry.content.entryReason.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            if (entry.content.reason &&
                entry.content.reason.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            if (entry.content.note &&
                entry.content.note.toLowerCase().includes(lowerQuery)) {
                return true;
            }

            return false;
        });
    },

    /**
     * Generate daily summary text
     */
    generateDailySummary(trades, skips) {
        const tradeCount = trades.length;
        const skipCount = skips.length;
        const totalSetups = tradeCount + skipCount;

        if (totalSetups === 0) {
            return 'No trading activity today';
        }

        let summary = `Evaluated ${totalSetups} setup${totalSetups > 1 ? 's' : ''}: `;
        summary += `${tradeCount} trade${tradeCount !== 1 ? 's' : ''} taken, `;
        summary += `${skipCount} skipped. `;

        if (skipCount > tradeCount) {
            summary += 'Excellent discipline!';
        } else if (tradeCount > 0) {
            summary += 'Stay disciplined!';
        }

        return summary;
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.JournalManager = JournalManager;
}

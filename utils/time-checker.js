/**
 * TIDE - Time Checker
 * Validates current time against trading session windows
 */

const TimeChecker = {
    /**
     * Check if current time is within trading windows
     * @param {object} windows - Trading windows from settings
     * @returns {object} Time validation result
     */
    checkTradingWindow(windows) {
        const now = new Date();
        const currentTime = this.getCurrentTimeIST(now);
        const dayOfWeek = now.getDay();

        // Check if weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            return {
                inWindow: false,
                reason: 'WEEKEND',
                message: 'Market closed on weekends',
                currentTime: currentTime.formatted
            };
        }

        // Check morning window
        if (windows.morning.enabled) {
            if (this.isInWindow(currentTime, windows.morning.start, windows.morning.end)) {
                return {
                    inWindow: true,
                    session: 'MORNING',
                    message: 'Inside morning trading window',
                    currentTime: currentTime.formatted,
                    windowEnd: windows.morning.end
                };
            }
        }

        // Check evening window
        if (windows.evening.enabled) {
            if (this.isInWindow(currentTime, windows.evening.start, windows.evening.end)) {
                return {
                    inWindow: true,
                    session: 'EVENING',
                    message: 'Inside evening trading window',
                    currentTime: currentTime.formatted,
                    windowEnd: windows.evening.end
                };
            }
        }

        // Outside all windows
        return {
            inWindow: false,
            reason: 'OUTSIDE_WINDOW',
            message: 'Outside permitted trading windows',
            currentTime: currentTime.formatted,
            nextWindow: this.getNextWindow(currentTime, windows)
        };
    },

    /**
     * Get current time in IST
     */
    getCurrentTimeIST(now = new Date()) {
        // IST is UTC+5:30
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istTime = new Date(now.getTime() + istOffset);

        const hours = istTime.getUTCHours();
        const minutes = istTime.getUTCMinutes();

        return {
            hours,
            minutes,
            formatted: this.formatTime(hours, minutes),
            totalMinutes: hours * 60 + minutes
        };
    },

    /**
     * Check if current time is within a window
     */
    isInWindow(currentTime, startStr, endStr) {
        const start = this.parseTime(startStr);
        const end = this.parseTime(endStr);

        const current = currentTime.totalMinutes;
        const startMinutes = start.hours * 60 + start.minutes;
        const endMinutes = end.hours * 60 + end.minutes;

        return current >= startMinutes && current <= endMinutes;
    },

    /**
     * Parse time string (HH:MM) to object
     */
    parseTime(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return { hours, minutes };
    },

    /**
     * Format time to HH:MM AM/PM
     */
    formatTime(hours, minutes) {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${period}`;
    },

    /**
     * Get next trading window
     */
    getNextWindow(currentTime, windows) {
        const current = currentTime.totalMinutes;

        // Check if before morning window
        if (windows.morning.enabled) {
            const morningStart = this.parseTime(windows.morning.start);
            const morningStartMinutes = morningStart.hours * 60 + morningStart.minutes;

            if (current < morningStartMinutes) {
                return `Morning session at ${windows.morning.start}`;
            }
        }

        // Check if before evening window
        if (windows.evening.enabled) {
            const eveningStart = this.parseTime(windows.evening.start);
            const eveningStartMinutes = eveningStart.hours * 60 + eveningStart.minutes;

            if (current < eveningStartMinutes) {
                return `Evening session at ${windows.evening.start}`;
            }
        }

        // After all windows today
        if (windows.morning.enabled) {
            return `Tomorrow morning at ${windows.morning.start}`;
        }

        return 'Next trading day';
    },

    /**
     * Get time remaining in current window (in minutes)
     */
    getTimeRemaining(currentTime, windowEnd) {
        const current = currentTime.totalMinutes;
        const end = this.parseTime(windowEnd);
        const endMinutes = end.hours * 60 + end.minutes;

        return Math.max(0, endMinutes - current);
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.TimeChecker = TimeChecker;
}

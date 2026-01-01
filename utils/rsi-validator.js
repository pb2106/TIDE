/**
 * TIDE - RSI Validator
 * Validates RSI alignment with trend bias
 */

const RSIValidator = {
    /**
     * Validate RSI alignment with trend
     * @param {number} rsi - RSI value (0-100)
     * @param {string} trendBias - 'BULLISH', 'BEARISH', or 'CHOPPY'
     * @returns {object} Validation result
     */
    validate(rsi, trendBias) {
        // Validate RSI input
        if (typeof rsi !== 'number' || rsi < 0 || rsi > 100) {
            return {
                valid: false,
                error: 'RSI must be between 0 and 100'
            };
        }

        // Get RSI zone
        const zone = this.getZone(rsi);

        // Check alignment with trend
        const alignment = this.checkAlignment(rsi, zone, trendBias);

        return {
            valid: true,
            rsi,
            zone,
            ...alignment
        };
    },

    /**
     * Determine RSI zone
     */
    getZone(rsi) {
        if (rsi < 30) return 'OVERSOLD';
        if (rsi < 50) return 'WEAK';
        if (rsi < 70) return 'STRONG';
        return 'OVERBOUGHT';
    },

    /**
     * Check RSI alignment with trend bias
     */
    checkAlignment(rsi, zone, trendBias) {
        // If choppy market, no trades regardless of RSI
        if (trendBias === 'CHOPPY') {
            return {
                aligned: false,
                status: 'NO TRADE',
                color: '#FFB800',
                icon: '[X]',
                message: 'No trading in choppy conditions',
                warning: 'Wait for clear trend before trading'
            };
        }

        // Bullish trend scenarios
        if (trendBias === 'BULLISH') {
            if (rsi > 70) {
                return {
                    aligned: false,
                    status: 'OVERBOUGHT',
                    color: '#FFB800',
                    icon: '[!]',
                    message: 'RSI overbought - not ideal for BUY',
                    warning: 'Wait for pullback before entering'
                };
            } else if (rsi >= 50) {
                return {
                    aligned: true,
                    status: 'STRONG TREND',
                    color: '#00D09C',
                    icon: '[OK]',
                    message: 'RSI > 50 - Bullish aligned',
                    warning: zone === 'STRONG' ? 'Approaching overbought - wait for pullback' : null
                };
            } else if (rsi >= 30) {
                return {
                    aligned: false,
                    status: 'WEAK',
                    color: '#FFB800',
                    icon: '[!]',
                    message: 'RSI 30-50 - Weak momentum',
                    warning: 'Wait for RSI to strengthen above 50'
                };
            } else {
                return {
                    aligned: false,
                    status: 'OVERSOLD',
                    color: '#EB5B3C',
                    icon: '[X]',
                    message: 'RSI < 30 - Not ideal for BUY',
                    warning: 'Oversold in uptrend - wait for reversal'
                };
            }
        }

        // Bearish trend scenarios
        if (trendBias === 'BEARISH') {
            if (rsi < 30) {
                return {
                    aligned: false,
                    status: 'OVERSOLD',
                    color: '#FFB800',
                    icon: '[!]',
                    message: 'RSI oversold - not ideal for SELL',
                    warning: 'Wait for bounce before entering'
                };
            } else if (rsi < 50) {
                return {
                    aligned: true,
                    status: 'STRONG TREND',
                    color: '#00D09C',
                    icon: '[OK]',
                    message: 'RSI < 50 - Bearish aligned',
                    warning: zone === 'WEAK' ? 'Approaching oversold - wait for bounce' : null
                };
            } else if (rsi < 70) {
                return {
                    aligned: false,
                    status: 'WEAK',
                    color: '#FFB800',
                    icon: '[!]',
                    message: 'RSI 50-70 - Weak momentum',
                    warning: 'Wait for RSI to weaken below 50'
                };
            } else {
                return {
                    aligned: false,
                    status: 'OVERBOUGHT',
                    color: '#EB5B3C',
                    icon: '[X]',
                    message: 'RSI > 70 - Not ideal for SELL',
                    warning: 'Overbought in downtrend - wait for reversal'
                };
            }
        }

        // Fallback
        return {
            aligned: false,
            status: 'UNKNOWN',
            color: '#888',
            icon: '[?]',
            message: 'Unable to determine alignment',
            warning: null
        };
    },

    /**
     * Get gauge position for visual display (0-100)
     */
    getGaugePosition(rsi) {
        return Math.min(100, Math.max(0, rsi));
    },

    /**
     * Get gauge color based on RSI zones
     */
    getGaugeColor(rsi) {
        if (rsi < 30) return '#EB5B3C'; // Red - oversold
        if (rsi < 50) return '#FFB800'; // Yellow - weak
        if (rsi < 70) return '#00D09C'; // Green - strong
        return '#EB5B3C'; // Red - overbought
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.RSIValidator = RSIValidator;
}

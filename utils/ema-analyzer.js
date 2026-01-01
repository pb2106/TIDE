/**
 * TIDE - EMA Analyzer
 * Analyzes EMA 10, 21, 100 relationships to identify trading patterns
 */

const EMAAnalyzer = {
    /**
     * Main analysis function
     * @param {number} ema10 - EMA 10 value
     * @param {number} ema21 - EMA 21 value
     * @param {number} ema100 - EMA 100 value
     * @returns {object} Pattern analysis result
     */
    analyze(ema10, ema21, ema100) {
        // Validate inputs
        if (!this.validateEMAs(ema10, ema21, ema100)) {
            return {
                valid: false,
                error: 'Invalid EMA values. Please enter positive numbers.'
            };
        }

        // Determine fast trend direction (10 vs 21)
        const fastTrend = this.compareFastEMAs(ema10, ema21);

        // Determine overall trend context (both vs 100)
        const overallTrend = this.compareWithEMA100(ema10, ema21, ema100);

        // Match to one of 5 patterns
        const pattern = this.identifyPattern(fastTrend, overallTrend);

        return {
            valid: true,
            pattern: pattern.name,
            color: pattern.color,
            icon: pattern.icon,
            recommendation: pattern.recommendation,
            warning: pattern.warning,
            tradeable: pattern.tradeable,
            fastTrend,
            overallTrend,
            emaValues: { ema10, ema21, ema100 }
        };
    },

    /**
     * Validate EMA inputs
     */
    validateEMAs(ema10, ema21, ema100) {
        return (
            typeof ema10 === 'number' && ema10 > 0 &&
            typeof ema21 === 'number' && ema21 > 0 &&
            typeof ema100 === 'number' && ema100 > 0
        );
    },

    /**
     * Compare EMA 10 vs EMA 21 (fast trend)
     */
    compareFastEMAs(ema10, ema21) {
        const diff = ((ema10 - ema21) / ema21) * 100;

        if (Math.abs(diff) < 0.5) {
            return 'FLAT';
        } else if (diff > 0) {
            return 'UP';
        } else {
            return 'DOWN';
        }
    },

    /**
     * Compare both fast EMAs vs EMA 100 (overall trend)
     */
    compareWithEMA100(ema10, ema21, ema100) {
        const avg = (ema10 + ema21) / 2;
        const diff = ((avg - ema100) / ema100) * 100;

        if (Math.abs(diff) < 1) {
            return 'CHOPPY';
        } else if (diff > 0) {
            return 'UPTREND';
        } else {
            return 'DOWNTREND';
        }
    },

    /**
     * Identify the trading pattern based on trends
     */
    identifyPattern(fastTrend, overallTrend) {
        // Pattern 1: Bull Accelerating
        if (fastTrend === 'UP' && overallTrend === 'UPTREND') {
            return {
                name: 'Bull Accelerating',
                color: '#00D09C', // Green
                icon: '[+]',
                recommendation: 'Buy on pullback to EMA 10-21 zone',
                warning: 'Wait for pullback - don\'t chase price',
                tradeable: true
            };
        }

        // Pattern 2: Risky Bull in Bear
        if (fastTrend === 'UP' && overallTrend === 'DOWNTREND') {
            return {
                name: 'Risky Bull in Bear',
                color: '#FFB800', // Orange
                icon: '[!]',
                recommendation: 'SKIP - Counter-trend trade',
                warning: 'Trading against major trend is risky',
                tradeable: false
            };
        }

        // Pattern 3: Bear Accelerating
        if (fastTrend === 'DOWN' && overallTrend === 'DOWNTREND') {
            return {
                name: 'Bear Accelerating',
                color: '#EB5B3C', // Red
                icon: '[-]',
                recommendation: 'Sell on pullback to EMA 10-21 zone',
                warning: 'Wait for pullback - don\'t chase price',
                tradeable: true
            };
        }

        // Pattern 4: Risky Bear in Bull
        if (fastTrend === 'DOWN' && overallTrend === 'UPTREND') {
            return {
                name: 'Risky Bear in Bull',
                color: '#FFB800', // Orange
                icon: '[!]',
                recommendation: 'SKIP - Counter-trend trade',
                warning: 'Trading against major trend is risky',
                tradeable: false
            };
        }

        // Pattern 5: Choppy/Sideways
        return {
            name: 'Choppy/Sideways',
            color: '#FFB800', // Yellow
            icon: '[~]',
            recommendation: 'NO TRADE - Wait for trend clarity',
            warning: 'Avoid trading in choppy conditions',
            tradeable: false
        };
    },

    /**
     * Get trend bias for price vs EMA 100
     */
    getTrendBias(price, ema100) {
        const diff = ((price - ema100) / ema100) * 100;

        if (Math.abs(diff) < 1) {
            return {
                bias: 'CHOPPY',
                color: '#FFB800',
                icon: '[~]',
                status: 'Price near EMA 100',
                action: 'NO TRADE - Wait for clarity'
            };
        } else if (diff > 0) {
            return {
                bias: 'BULLISH',
                color: '#00D09C',
                icon: '[+]',
                status: 'Price ABOVE EMA 100',
                action: 'Trade BUY setups only'
            };
        } else {
            return {
                bias: 'BEARISH',
                color: '#EB5B3C',
                icon: '[-]',
                status: 'Price BELOW EMA 100',
                action: 'Trade SELL setups only'
            };
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.EMAAnalyzer = EMAAnalyzer;
}

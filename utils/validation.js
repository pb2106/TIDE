/**
 * TIDE - Trade Validation
 * Enforces all trading rules and determines button states
 */

const TradeValidator = {
    /**
     * Validate if trade can be confirmed
     * @param {object} params - Validation parameters
     * @returns {object} Validation result
     */
    validate(params) {
        const {
            tradesCount,
            maxTrades,
            timeCheck,
            emaAnalysis,
            rsiValidation,
            pullbackConfirmed
        } = params;

        const rules = [];
        let canTrade = true;
        let buttonState = 'ENABLED'; // ENABLED, WARNING, DISABLED
        let primaryReason = null;

        // Rule 1: Trade Count Limit (HARD)
        const rule1 = this.validateTradeCount(tradesCount, maxTrades);
        rules.push(rule1);
        if (!rule1.passed) {
            canTrade = false;
            buttonState = 'DISABLED';
            primaryReason = rule1.message;
        }

        // Rule 2: Session Timing (HARD)
        const rule2 = this.validateTiming(timeCheck);
        rules.push(rule2);
        if (!rule2.passed) {
            canTrade = false;
            buttonState = 'DISABLED';
            if (!primaryReason) primaryReason = rule2.message;
        }

        // Rule 3: Pattern Validity (HARD)
        const rule3 = this.validatePattern(emaAnalysis);
        rules.push(rule3);
        if (!rule3.passed) {
            canTrade = false;
            buttonState = 'DISABLED';
            if (!primaryReason) primaryReason = rule3.message;
        }

        // Rule 4: Weekend Check (HARD)
        const rule4 = this.validateWeekend(timeCheck);
        rules.push(rule4);
        if (!rule4.passed) {
            canTrade = false;
            buttonState = 'DISABLED';
            if (!primaryReason) primaryReason = rule4.message;
        }

        // Rule 5: Pullback Confirmation (SOFT)
        const rule5 = this.validatePullback(pullbackConfirmed);
        rules.push(rule5);
        if (!rule5.passed && canTrade) {
            buttonState = 'WARNING';
            if (!primaryReason) primaryReason = rule5.message;
        }

        // Rule 6: RSI Alignment (SOFT)
        const rule6 = this.validateRSI(rsiValidation);
        rules.push(rule6);
        if (!rule6.passed && canTrade && buttonState === 'ENABLED') {
            buttonState = 'WARNING';
            if (!primaryReason) primaryReason = rule6.message;
        }

        return {
            canTrade,
            buttonState,
            primaryReason,
            rules,
            passedCount: rules.filter(r => r.passed).length,
            totalRules: rules.length
        };
    },

    /**
     * Rule 1: Trade count limit
     */
    validateTradeCount(count, max) {
        const passed = count < max;
        return {
            id: 'TRADE_COUNT',
            name: 'Trade Count Limit',
            passed,
            type: 'HARD',
            icon: passed ? '✅' : '🔴',
            message: passed
                ? `${count}/${max} trades used today`
                : `Maximum ${max} trades reached for today`
        };
    },

    /**
     * Rule 2: Session timing
     */
    validateTiming(timeCheck) {
        const passed = timeCheck.inWindow;
        return {
            id: 'SESSION_TIMING',
            name: 'Trading Window',
            passed,
            type: 'HARD',
            icon: passed ? '✅' : '🔴',
            message: passed
                ? `In ${timeCheck.session} session`
                : timeCheck.message
        };
    },

    /**
     * Rule 3: Pattern validity
     */
    validatePattern(emaAnalysis) {
        const passed = emaAnalysis && emaAnalysis.valid && emaAnalysis.tradeable;
        return {
            id: 'PATTERN_VALID',
            name: 'EMA Pattern',
            passed,
            type: 'HARD',
            icon: passed ? '✅' : '🔴',
            message: passed
                ? `${emaAnalysis.pattern} - Tradeable`
                : emaAnalysis && emaAnalysis.pattern
                    ? `${emaAnalysis.pattern} - Skip this setup`
                    : 'Pattern not analyzed'
        };
    },

    /**
     * Rule 4: Weekend check
     */
    validateWeekend(timeCheck) {
        const passed = timeCheck.reason !== 'WEEKEND';
        return {
            id: 'WEEKEND_CHECK',
            name: 'Market Open',
            passed,
            type: 'HARD',
            icon: passed ? '✅' : '🔴',
            message: passed
                ? 'Market is open'
                : 'Market closed on weekends'
        };
    },

    /**
     * Rule 5: Pullback confirmation (soft)
     */
    validatePullback(confirmed) {
        return {
            id: 'PULLBACK_CONFIRM',
            name: 'Pullback Present',
            passed: confirmed === true,
            type: 'SOFT',
            icon: confirmed ? '✅' : '⚠️',
            message: confirmed
                ? 'Pullback confirmed'
                : 'Confirm pullback is visible on chart'
        };
    },

    /**
     * Rule 6: RSI alignment (soft)
     */
    validateRSI(rsiValidation) {
        const passed = rsiValidation && rsiValidation.valid && rsiValidation.aligned;
        return {
            id: 'RSI_ALIGNED',
            name: 'RSI Alignment',
            passed,
            type: 'SOFT',
            icon: passed ? '✅' : '⚠️',
            message: passed
                ? rsiValidation.message
                : rsiValidation && rsiValidation.message
                    ? rsiValidation.message
                    : 'RSI not analyzed'
        };
    },

    /**
     * Get button styling based on state
     */
    getButtonStyle(state) {
        switch (state) {
            case 'ENABLED':
                return {
                    backgroundColor: '#00D09C',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    opacity: 1,
                    disabled: false
                };
            case 'WARNING':
                return {
                    backgroundColor: '#FFB800',
                    color: '#1C1C1E',
                    cursor: 'pointer',
                    opacity: 1,
                    disabled: false
                };
            case 'DISABLED':
                return {
                    backgroundColor: '#444',
                    color: '#888',
                    cursor: 'not-allowed',
                    opacity: 0.5,
                    disabled: true
                };
            default:
                return {};
        }
    }
};

// Make available globally
if (typeof window !== 'undefined') {
    window.TradeValidator = TradeValidator;
}

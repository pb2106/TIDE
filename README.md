# 🌊 TIDE - Trading Insight & Discipline Engine

**Tagline:** "Ride the TIDE, stay disciplined"

A Chrome Extension overlay for Groww.com that enforces EMA+RSI trading discipline through visual guidance, hard limits, and journaling - **WITHOUT any automated trading**.

![TIDE Version](https://img.shields.io/badge/version-1.0.0-00D09C)
![Manifest Version](https://img.shields.io/badge/manifest-v3-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## 📋 Overview

TIDE is your personal trading discipline coach that overlays on Groww chart pages to help you:
- ✅ Analyze EMA (10, 21, 100) patterns in real-time
- ✅ Validate RSI alignment with trend direction
- ✅ Enforce a hard 3-trade-per-day limit
- ✅ Restrict trading to specific session windows
- ✅ Maintain a comprehensive trade journal
- ✅ Protect against FOMO and emotional trading

### What TIDE Does NOT Do
- ❌ No automated order placement
- ❌ No API calls to Groww's trading backend  
- ❌ No modification of Groww's native UI
- ❌ No external data transmission (100% local)

---

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   ```bash
   cd /home/naegleria/Trade\ guidance/tide-extension
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `tide-extension` folder

3. **Verify Installation**
   - You should see the TIDE icon (🌊) in your browser toolbar
   - The extension is now ready to use

### First Use

1. Navigate to any Groww stock chart page (e.g., `groww.in/stocks/*/chart`)
2. The TIDE overlay will appear in the top-right corner
3. On first visit, you'll see a welcome splash screen
4. Start by entering EMA values from the Groww chart

---

## 🎯 Features

### 1. **Trend Bias Indicator**
Shows whether price is above, below, or near EMA 100 to determine trend direction.

- 🟢 **BULLISH**: Price > EMA 100 → Trade BUY setups only
- 🔴 **BEARISH**: Price < EMA 100 → Trade SELL setups only
- 🟡 **CHOPPY**: Price ≈ EMA 100 → NO TRADE

### 2. **EMA Pattern Analyzer**
Identifies 5 distinct EMA patterns:

1. **Bull Accelerating** (10>21, both>100) ✅ Tradeable
2. **Risky Bull in Bear** (10>21, both<100) ⚠️ Skip
3. **Bear Accelerating** (10<21, both<100) ✅ Tradeable
4. **Risky Bear in Bull** (10<21, both>100) ⚠️ Skip
5. **Choppy/Sideways** (10≈21, ≈100) 🛑 Skip

**Manual Entry Required**: You read EMA values from Groww's chart and enter them into TIDE.

### 3. **RSI Confirmation**
Validates RSI alignment with the current trend:

- Checks if RSI supports your trade direction
- Warns about overbought/oversold conditions
- Visual gauge shows RSI position

### 4. **Trade Validation Controls**
Enforces discipline through hard limits:

- **3-Trade Limit**: Hard block after 3 trades per day
- **Session Windows**: 
  - Morning: 09:15 AM - 10:45 AM (first 90 min)
  - Evening: 02:00 PM - 03:30 PM (last 90 min)
- **Weekend Block**: No trading on Sat/Sun
- **Pattern Validation**: Blocks counter-trend trades

**Button States**:
- 🟢 **Green**: All checks passed, trade allowed
- 🟡 **Yellow**: Warning (soft rule failed), trade allowed with caution
- 🔴 **Red/Disabled**: Hard rule failed, trade blocked

### 5. **Trade Journal**
Built-in journaling system:

- **Auto-logged**: Trade confirmations with pattern snapshots
- **Manual notes**: Observations and learnings
- **Skipped setups**: Tracks when you showed discipline
- **Export**: Download as CSV for analysis

---

## 📊 How It Works

### Daily Workflow

**Morning Preparation (09:00 AM)**
1. TIDE auto-resets at 09:15 AM IST
2. Trade counter resets to 0/3
3. Yesterday's trades archived to journal

**During Trading**
1. Identify setup on Groww chart
2. Read EMA 10, 21, 100 from chart
3. Enter values into TIDE → Get pattern analysis
4. Read RSI from chart → Enter into TIDE
5. Review validation checklist
6. Click CONFIRM TRADE (if all rules pass)
7. Fill trade details modal
8. Trade logged automatically

**End of Day**
1. Review trades in journal
2. Add outcome notes (win/loss)
3. Write daily summary
4. Check statistics in settings

### Data Flow

```
User Input (Manual) → TIDE Analysis → Validation → Journal Storage
     ↓                      ↓              ↓           ↓
  EMA/RSI             Pattern Match    Rules Check   Local DB
  from Chart          + Alignment      + Limits      (chrome.storage)
```

---

## ⚙️ Settings

Click the TIDE icon in the toolbar to access settings:

### Trade Limits
- Max trades per day (default: 3, range: 1-10)

### Session Windows
- Morning session: Enable/disable, set start/end time
- Evening session: Enable/disable, set start/end time
- Times are in IST (Indian Standard Time)

### Data Management
- **Export Journal**: Download CSV of all entries
- **Reset Data**: Clear all stored data (CAUTION: irreversible!)

### Statistics
View your performance metrics:
- Total trades
- Win rate (%)
- Average return (%)
- Discipline score (% of rules followed)

---

## 🔒 Privacy & Security

### 100% Local Operation
- All data stored in browser only (`chrome.storage.local`)
- No external servers or APIs
- No data transmission outside your computer
- Works completely offline

### Permissions Used
- **storage**: Save settings and journal locally
- **activeTab**: Inject overlay on current tab
- **scripting**: Dynamically inject content script
- **host_permissions (groww.in)**: Only works on Groww domain
- **alarms**: Daily reset scheduler

### Data Storage
- **Location**: Browser's local storage (not cloud)
- **Capacity**: Up to 10MB (stores ~500 journal entries)
- **Persistence**: Survives browser restarts
- **Privacy**: Never leaves your device

---

## 🏗️ Technical Architecture

### Technology Stack
- **Extension Type**: Chrome Extension Manifest V3
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+)
- **Storage**: chrome.storage.local API
- **Styling**: Custom CSS with glassmorphism effects
- **No Dependencies**: Zero external libraries

### File Structure
```
tide-extension/
├── manifest.json           # Extension configuration
├── background.js          # Service worker (lifecycle)
├── content.js             # Main overlay injection
├── overlay.css            # Glassmorphism styling
├── splash.html            # First-time welcome screen
├── popup.html             # Settings interface
├── popup.js               # Settings logic
├── icons/                 # Extension icons
│   ├── icon-16.png
│   ├── icon-48.png
│   └── icon-128.png
└── utils/
    ├── storage-manager.js # Storage operations
    ├── ema-analyzer.js    # Pattern recognition
    ├── rsi-validator.js   # RSI alignment
    ├── time-checker.js    # Session timing
    ├── validation.js      # Trade validation
    └── journal-manager.js # Journal CRUD
```

### Key Design Decisions

**Why Manifest V3?**
- Chrome's current standard (V2 deprecated)
- Better performance with service workers
- Future-proof for ongoing updates

**Why chrome.storage.local vs localStorage?**
- 10MB capacity (vs 5MB)
- Async operations (won't freeze UI)
- Better for extension architecture
- Persists through history clearing

**Why Manual Data Entry?**
- No dependency on Groww's DOM structure
- Won't break when Groww updates
- Full user awareness of values
- Compliant with Groww's terms

---

## 🛠️ Development

### Project Status
✅ **Production Ready** - v1.0.0

### Testing Locally

1. **Load Extension**
   ```bash
   # Navigate to chrome://extensions/
   # Enable Developer mode
   # Click "Load unpacked"
   # Select tide-extension folder
   ```

2. **Test on Groww**
   - Go to `groww.in/stocks/RELIANCE/chart` (or any stock)
   - Overlay should appear in top-right
   - Test all 5 sections

3. **Test Daily Reset**
   - Manually trigger: Change system time to 09:15 AM
   - Or wait for automatic reset

### Debugging

**Console Logs**
- Open DevTools (F12) on Groww page
- Check Console tab for TIDE logs
- Look for initialization messages

**Storage Inspection**
```javascript
// Run in Groww page console
chrome.storage.local.get('tideData', (result) => {
  console.log(result.tideData);
});
```

### Making Changes

**Modify Styles**
- Edit `overlay.css`
- Reload extension in `chrome://extensions/`
- Refresh Groww page

**Modify Logic**
- Edit relevant utility file or `content.js`
- Reload extension
- Refresh Groww page

---

## 📈 Usage Examples

### Example 1: Bull Accelerating Setup

**Scenario**: RELIANCE showing bullish pattern

1. **Chart Analysis**
   - Price: ₹2,450
   - EMA 10: ₹2,438
   - EMA 21: ₹2,425
   - EMA 100: ₹2,380
   - RSI: 58

2. **TIDE Steps**
   - Enter EMA 10: 2438, EMA 21: 2425, EMA 100: 2380
   - Click "Analyze Pattern"
   - Result: 🟢 Bull Accelerating - Tradeable
   - Enter RSI: 58
   - Result: ✅ Strong trend, aligned
   - Check pullback: ✓ Price near EMA 10-21
   - Click CONFIRM TRADE
   - Symbol: RELIANCE, Action: BUY
   - Reason: "EMA 10 bounced from 21, RSI strong"

3. **Result**
   - Trade logged: 1/3 used
   - Journal entry created
   - Remaining trades: 2

### Example 2: Risky Setup (Blocked)

**Scenario**: Counter-trend trade attempt

- Pattern: Risky Bear in Bull (10<21, both>100)
- TIDE blocks with: 🔴 "SKIP - Counter-trend trade"
- Button disabled, trade prevented
- Discipline maintained! 🌊

---

## ❓ FAQ

**Q: Will this place trades automatically?**  
A: No. TIDE only provides guidance. You manually place trades on Groww.

**Q: Does it read data from Groww's chart automatically?**  
A: No. You manually read EMA/RSI values and enter them into TIDE.

**Q: What happens if I reach 3 trades?**  
A: The CONFIRM button becomes disabled and you can't log more trades until the next day.

**Q: Can I override the 3-trade limit?**  
A: There's a hidden "Reset Counter" in settings for emergencies, but it's discouraged.

**Q: Will my journal be lost if I clear browser data?**  
A: Yes, export your journal regularly to CSV for backup.

**Q: Does it work on mobile?**  
A: No, it's a Chrome Extension for desktop only.

**Q: Can I use it on other trading platforms?**  
A: Currently only works on grow.in. Would need modification for others.

**Q: Is my data shared anywhere?**  
A: Absolutely not. Everything stays 100% local in your browser.

---

## 🤝 Contributing

This is a personal discipline tool. If you want to suggest improvements:

1. Test thoroughly on Groww
2. Ensure no API calls to Groww backend
3. Maintain privacy-first approach
4. Keep performance lightweight

---

## 📄 License

MIT License - Free to use and modify for personal use.

---

## 🙏 Acknowledgments

- Inspired by disciplined traders who follow their rules
- Built for the Indian trading community
- Designed to complement Groww.com's excellent platform

---

## 📞 Support

For issues or questions:
- Check the FAQ section above
- Review console logs for debugging
- Ensure you're using the latest Chrome version

---

**Remember**: Discipline is the bridge between goals and accomplishment. Ride the TIDE! 🌊

---

**Version**: 1.0.0  
**Last Updated**: January 2026  
**Target Platform**: Groww.com  
**Browser**: Google Chrome (Manifest V3)

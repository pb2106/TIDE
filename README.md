# 🌊 TIDE - Trading Insight & Discipline Engine
"Trade with TIDE, not against it"

A Chrome Extension overlay for Groww.com that enforces EMA+RSI trading discipline through visual guidance, hard limits, and journalism.

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
   git clone https://github.com/pb2106/TIDE
   ```

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked"
   - Select the `TIDE` folder

3. **Verify Installation**
   - You should see the TIDE icon (🌊) in your browser toolbar
   - The extension is now ready to use

### First Use

1. Navigate to any Groww stock chart page
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

## 📄 License

MIT License - Free to use and modify for personal use.

---

**Remember**: Discipline is the bridge between goals and accomplishment. Surf the TIDE! 🌊

---

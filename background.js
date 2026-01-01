/**
 * TIDE - Background Service Worker
 * Handles extension lifecycle, daily resets, and storage initialization
 */

// Install event - Initialize storage on first install
chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason === 'install') {
    console.log('TIDE installed - initializing storage');
    
    // Initialize default storage structure
    const defaultData = {
      currentSession: {
        date: new Date().toISOString().split('T')[0],
        tradesCount: 0,
        trades: [],
        skippedSetups: []
      },
      settings: {
        maxTradesPerDay: 3,
        tradingWindows: {
          morning: {
            enabled: true,
            start: '09:15',
            end: '10:45'
          },
          evening: {
            enabled: true,
            start: '14:00',
            end: '15:30'
          }
        },
        riskPerTrade: 1,
        soundAlerts: true,
        panelPosition: { x: 100, y: 50 },
        collapsedSections: [],
        theme: 'dark'
      },
      journal: [],
      statistics: {
        totalTrades: 0,
        winRate: 0,
        avgReturn: 0,
        bestPattern: null,
        worstPattern: null,
        mostTradedTime: null,
        disciplineScore: 1.0
      },
      hasSeenSplash: false
    };
    
    await chrome.storage.local.set({ tideData: defaultData });
    console.log('TIDE storage initialized');
  }
});

// Set up daily reset alarm (triggers at 09:15 AM IST)
chrome.alarms.create('dailyReset', {
  when: getNextResetTime(),
  periodInMinutes: 1440 // 24 hours
});

// Handle alarm events
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'dailyReset') {
    console.log('Daily reset alarm triggered');
    await performDailyReset();
  }
});

/**
 * Calculate next 09:15 AM IST reset time
 */
function getNextResetTime() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
  
  // Get current IST time
  const istNow = new Date(now.getTime() + istOffset);
  
  // Set reset time to 09:15 AM IST
  const resetTime = new Date(istNow);
  resetTime.setHours(9, 15, 0, 0);
  
  // If already past 09:15 today, set for tomorrow
  if (istNow.getTime() > resetTime.getTime()) {
    resetTime.setDate(resetTime.getDate() + 1);
  }
  
  // Convert back to local time
  return resetTime.getTime() - istOffset;
}

/**
 * Perform daily reset - archive session and clear counters
 */
async function performDailyReset() {
  try {
    const { tideData } = await chrome.storage.local.get('tideData');
    
    if (!tideData) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    // Only reset if date has changed
    if (tideData.currentSession.date !== today) {
      // Archive today's trades to journal
      if (tideData.currentSession.trades.length > 0) {
        tideData.currentSession.trades.forEach(trade => {
          tideData.journal.push({
            id: trade.id,
            date: tideData.currentSession.date,
            time: new Date(trade.timestamp).toLocaleTimeString('en-IN'),
            type: 'trade',
            content: trade,
            outcome: null
          });
        });
      }
      
      // Archive skipped setups
      if (tideData.currentSession.skippedSetups.length > 0) {
        tideData.currentSession.skippedSetups.forEach(skip => {
          tideData.journal.push({
            id: generateUUID(),
            date: tideData.currentSession.date,
            time: new Date(skip.timestamp).toLocaleTimeString('en-IN'),
            type: 'skip',
            content: skip,
            outcome: null
          });
        });
      }
      
      // Reset session for new day
      tideData.currentSession = {
        date: today,
        tradesCount: 0,
        trades: [],
        skippedSetups: []
      };
      
      // Keep only last 500 journal entries
      if (tideData.journal.length > 500) {
        tideData.journal = tideData.journal.slice(-500);
      }
      
      await chrome.storage.local.set({ tideData });
      console.log('Daily reset completed for', today);
    }
  } catch (error) {
    console.error('Error in daily reset:', error);
  }
}

/**
 * Generate UUID v4
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkReset') {
    performDailyReset().then(() => {
      sendResponse({ success: true });
    });
    return true; // Keep channel open for async response
  }
});

console.log('TIDE background service worker loaded');

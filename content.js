/**
 * TIDE - Main Content Script
 * Injects overlay panel on Groww chart pages
 */

(function () {
  'use strict';

  // Check if already injected
  if (window.tideInitialized) return;
  window.tideInitialized = true;

  // State variables
  let currentData = null;
  let currentPosition = { x: window.innerWidth - 360, y: 50 }; // Start on right side
  let isDragging = false;
  let dragOffset = { x: 0, y: 0 };

  // Analysis state
  let emaAnalysis = null;
  let rsiValidation = null;
  let trendBias = null;
  let timeCheck = null;
  let pullbackConfirmed = false;

  /**
   * Initialize TIDE overlay
   */
  async function initTIDE() {
    try {
      // Get data from storage
      currentData = await StorageManager.getData();

      if (!currentData) {
        console.error('TIDE: No data found in storage');
        return;
      }

      // Check if first time
      if (!currentData.hasSeenSplash) {
        showSplash();
      }

      // Get saved position
      if (currentData.settings.panelPosition) {
        currentPosition = currentData.settings.panelPosition;
      }

      // Create overlay
      createOverlay();

      // Update all sections
      await updateAllSections();

      console.log('TIDE overlay initialized');
    } catch (error) {
      console.error('TIDE initialization error:', error);
    }
  }

  /**
   * Show splash screen on first visit
   */
  function showSplash() {
    const splash = document.createElement('iframe');
    splash.id = 'tide-splash';
    splash.src = chrome.runtime.getURL('splash.html');
    splash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
      z-index: 9999999;
    `;
    document.body.appendChild(splash);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      if (splash.parentNode) {
        splash.remove();
      }
    }, 4000);
  }

  /**
   * Create main overlay structure
   */
  function createOverlay() {
    const overlay = document.createElement('div');
    overlay.id = 'tide-overlay';
    overlay.style.top = `${currentPosition.y}px`;
    overlay.style.left = `${currentPosition.x}px`; // Use left instead of right

    overlay.innerHTML = `
      <div class="tide-panel">
        <div class="tide-header" id="tide-header">
          <div class="tide-logo">
            <span>TIDE</span>
          </div>
          <div>
            <button class="tide-peek-btn" id="tide-peek" title="Hold to peek through">👁</button>
            <button class="tide-minimize-btn" id="tide-minimize">−</button>
          </div>
        </div>

        ${createSection1()}
        ${createSection2()}
        ${createSection3()}
        ${createSection4()}
        ${createSection5()}
      </div>
    `;

    document.body.appendChild(overlay);

    // Attach event listeners
    attachHeaderDragListeners();
    attachPeekListeners();
    attachSectionToggles();
    attachInputListeners();
    attachButtonListeners();
  }

  /**
   * Section 1: Trend Bias Indicator
   */
  function createSection1() {
    return `
      <div class="tide-section" id="section-bias">
        <div class="tide-section-header">
          <div class="tide-section-title">
            <span>TREND BIAS</span>
          </div>
          <span class="tide-section-toggle">▼</span>
        </div>
        <div class="tide-section-content">
          <div class="tide-label tide-text-center">Price vs EMA 100</div>
          
          <div class="tide-indicator-circle tide-yellow" id="bias-circle">
            ?
          </div>
          
          <div class="tide-text-center">
            <div id="bias-status" class="tide-mb-1">Status: Loading...</div>
            <div id="bias-action" class="tide-gray" style="font-size: 13px;"></div>
          </div>

          <div class="tide-input-group tide-mt-2">
            <label class="tide-label">Current Price</label>
            <input type="number" class="tide-input" id="input-price" placeholder="Enter current price" step="0.01">
          </div>

          <div class="tide-input-group">
            <label class="tide-label">EMA 100 Value</label>
            <input type="number" class="tide-input" id="input-ema100-bias" placeholder="Enter EMA 100" step="0.01">
          </div>

          <button class="tide-button tide-button-primary" id="btn-update-bias">Update Bias</button>
        </div>
      </div>
    `;
  }

  /**
   * Section 2: EMA Pattern Analyzer
   */
  function createSection2() {
    return `
      <div class="tide-section" id="section-ema">
        <div class="tide-section-header">
          <div class="tide-section-title">
            <span>EMA PATTERN</span>
          </div>
          <span class="tide-section-toggle">▼</span>
        </div>
        <div class="tide-section-content">
          <div class="tide-label">EMA Relationships:</div>
          <div id="ema-relationships" class="tide-mb-2" style="font-size: 12px;">
            <div id="ema-10-21">• 10 vs 21: <span>--</span></div>
            <div id="ema-both-100">• Both vs 100: <span>--</span></div>
          </div>

          <div class="tide-text-center">
            <div class="tide-badge tide-yellow" id="pattern-badge">
              NO PATTERN YET
            </div>
          </div>

          <div class="tide-mt-1">
            <div class="tide-label">Recommended Action:</div>
            <div id="pattern-recommendation" class="tide-mb-1" style="color: #00D09C;">
              Enter EMA values to analyze pattern
            </div>
            <div id="pattern-warning" class="tide-gray" style="font-size: 12px;"></div>
          </div>

          <div class="tide-mt-2">
            <div class="tide-input-group">
              <label class="tide-label">EMA 10</label>
              <input type="number" class="tide-input" id="input-ema10" placeholder="0.00" step="0.01">
            </div>
            <div class="tide-input-group">
              <label class="tide-label">EMA 21</label>
              <input type="number" class="tide-input" id="input-ema21" placeholder="0.00" step="0.01">
            </div>
            <div class="tide-input-group">
              <label class="tide-label">EMA 100</label>
              <input type="number" class="tide-input" id="input-ema100" placeholder="0.00" step="0.01">
            </div>
            <button class="tide-button tide-button-primary" id="btn-update-ema">Analyze Pattern</button>
            <div id="ema-last-updated" class="tide-gray tide-text-center" style="font-size: 11px; margin-top: 8px;"></div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Section 3: RSI Confirmation
   */
  function createSection3() {
    return `
      <div class="tide-section" id="section-rsi">
        <div class="tide-section-header">
          <div class="tide-section-title">
            <span>RSI STATUS</span>
          </div>
          <span class="tide-section-toggle">▼</span>
        </div>
        <div class="tide-section-content">
          <div class="tide-label tide-text-center">Current RSI: <span id="rsi-value">--</span></div>
          
          <div style="margin: 20px 0;">
            <div style="position: relative; height: 40px; background: linear-gradient(90deg, #EB5B3C 0%, #FFB800 30%, #00D09C 50%, #FFB800 70%, #EB5B3C 100%); border-radius: 6px;">
              <div id="rsi-marker" style="position: absolute; top: -5px; left: 50%; width: 3px; height: 50px; background: #FFFFFF; transition: left 0.3s; display: none;"></div>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-top: 4px;">
              <span>0</span>
              <span>30</span>
              <span>50</span>
              <span>70</span>
              <span>100</span>
            </div>
          </div>

          <div class="tide-text-center">
            <div class="tide-status tide-status-warning" id="rsi-status" style="display: inline-flex;">
              <span>RSI not analyzed</span>
            </div>
          </div>

          <div id="rsi-message" class="tide-text-center tide-mt-1" style="font-size: 13px;"></div>
          <div id="rsi-warning" class="tide-gray tide-text-center" style="font-size: 12px; margin-top: 8px;"></div>

          <div class="tide-mt-2">
            <div class="tide-input-group">
              <label class="tide-label">RSI Value (0-100)</label>
              <input type="number" class="tide-input" id="input-rsi" placeholder="0" min="0" max="100" step="1">
            </div>
            <button class="tide-button tide-button-primary" id="btn-update-rsi">Validate RSI</button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Section 4: Trade Validation Controls
   */
  function createSection4() {
    return `
      <div class="tide-section" id="section-validation">
        <div class="tide-section-header">
          <div class="tide-section-title">
            <span>TRADE DECISION</span>
          </div>
          <span class="tide-section-toggle">▼</span>
        </div>
        <div class="tide-section-content">
          <div class="tide-label tide-text-center">Today's Status:</div>
          
          <div class="tide-counter tide-green" id="trade-counter">
            <div><span id="counter-count">0</span> / <span id="counter-max">3</span></div>
            <div class="tide-counter-text">trades used</div>
          </div>

          <div class="tide-text-center">
            <div class="tide-label">⏰ Current Time: <span id="current-time">--:--</span></div>
            <div id="time-status" class="tide-status tide-status-success tide-mt-1" style="display: inline-flex;">
              <span>--</span>
            </div>
          </div>

          <div class="tide-mt-2">
            <div class="tide-label">Pattern Check:</div>
            <div id="validation-rules" style="font-size: 13px; margin: 8px 0;">
              <div id="rule-count">[OK] Trade count</div>
              <div id="rule-time">[OK] Trading window</div>
              <div id="rule-pattern">[OK] Pattern valid</div>
              <div id="rule-rsi">[!] RSI alignment</div>
            </div>
          </div>

          

          <button class="tide-button tide-button-primary" id="btn-confirm-trade">
            CONFIRM TRADE
          </button>
          <button class="tide-button tide-button-secondary" id="btn-skip-trade">
            SKIP THIS SETUP
          </button>

          <div id="last-trade-info" class="tide-gray tide-text-center tide-mt-2" style="font-size: 12px;"></div>
        </div>
      </div>
    `;
  }

  /**
   * Section 5: Trade Journal
   */
  function createSection5() {
    return `
      <div class="tide-section collapsed" id="section-journal">
        <div class="tide-section-header">
          <div class="tide-section-title">
            <span>TRADE JOURNAL</span>
          </div>
          <span class="tide-section-toggle">▼</span>
        </div>
        <div class="tide-section-content">
          <div class="tide-input-group">
            <label class="tide-label">Quick Note:</label>
            <input type="text" class="tide-input" id="input-note" placeholder="Type your observation...">
          </div>
          <button class="tide-button tide-button-primary" id="btn-save-note">Save Note</button>

          <div style="height: 1px; background: rgba(255,255,255,0.1); margin: 16px 0;"></div>

          <div class="tide-label">Recent Entries:</div>
          <div id="journal-entries" class="tide-mt-1">
            <div class="tide-gray tide-text-center" style="padding: 20px;">
              No entries yet
            </div>
          </div>

          <button class="tide-button tide-button-secondary tide-mt-2" id="btn-export-journal">
            Export Journal (CSV)
          </button>
        </div>
      </div>
    `;
  }

  /**
   * Attach drag listeners to header
   */
  function attachHeaderDragListeners() {
    const header = document.getElementById('tide-header');
    const overlay = document.getElementById('tide-overlay');

    header.addEventListener('mousedown', (e) => {
      isDragging = true;
      overlay.classList.add('dragging');

      const rect = overlay.getBoundingClientRect();
      dragOffset.x = e.clientX - rect.left;
      dragOffset.y = e.clientY - rect.top;
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Keep within viewport bounds
      const maxX = window.innerWidth - overlay.offsetWidth;
      const maxY = window.innerHeight - overlay.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      overlay.style.left = `${boundedX}px`;
      overlay.style.top = `${boundedY}px`;

      currentPosition.x = boundedX;
      currentPosition.y = boundedY;
    });

    document.addEventListener('mouseup', async () => {
      if (isDragging) {
        isDragging = false;
        overlay.classList.remove('dragging');

        // Save position
        await StorageManager.updateSettings({ panelPosition: currentPosition });
      }
    });
  }

  /**
   * Attach peek button listeners
   */
  function attachPeekListeners() {
    const peekBtn = document.getElementById('tide-peek');
    const overlay = document.getElementById('tide-overlay');
    let isPeeking = false;

    // Start peeking when button is pressed
    peekBtn.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Don't trigger drag
      isPeeking = true;
      overlay.style.opacity = '0';
      overlay.style.pointerEvents = 'none';
    });

    // Stop peeking when mouse is released ANYWHERE
    document.addEventListener('mouseup', () => {
      if (isPeeking) {
        isPeeking = false;
        overlay.style.opacity = '0.85';
        overlay.style.pointerEvents = 'auto';
      }
    });
  }

  /**
   * Attach section toggle listeners
   */
  function attachSectionToggles() {
    document.querySelectorAll('.tide-section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.parentElement;
        section.classList.toggle('collapsed');
      });
    });
  }

  /**
   * Attach input and button listeners
   */
  function attachInputListeners() {
    // Update bias button
    document.getElementById('btn-update-bias').addEventListener('click', updateTrendBias);

    // Update EMA button
    document.getElementById('btn-update-ema').addEventListener('click', updateEMAPattern);

    // Update RSI button
    document.getElementById('btn-update-rsi').addEventListener('click', updateRSIValidation);

    // Pullback checkbox
    document.getElementById('pullback-check').addEventListener('change', (e) => {
      pullbackConfirmed = e.target.checked;
      updateValidation();
    });
  }

  /**
   * Attach button listeners
   */
  function attachButtonListeners() {
    document.getElementById('btn-confirm-trade').addEventListener('click', confirmTrade);
    document.getElementById('btn-skip-trade').addEventListener('click', skipTrade);
    document.getElementById('btn-save-note').addEventListener('click', saveNote);
    document.getElementById('btn-export-journal').addEventListener('click', exportJournal);
  }

  /**
   * Update trend bias
   */
  async function updateTrendBias() {
    const price = parseFloat(document.getElementById('input-price').value);
    const ema100 = parseFloat(document.getElementById('input-ema100-bias').value);

    if (!price || !ema100) {
      alert('Please enter both current price and EMA 100');
      return;
    }

    trendBias = EMAAnalyzer.getTrendBias(price, ema100);

    // Update UI
    const circle = document.getElementById('bias-circle');
    circle.innerHTML = trendBias.icon;
    circle.style.color = trendBias.color;

    document.getElementById('bias-status').innerHTML = `<strong>${trendBias.bias}</strong>: ${trendBias.status}`;
    document.getElementById('bias-action').textContent = `→ ${trendBias.action}`;

    await updateValidation();
  }

  /**
   * Update EMA pattern analysis
   */
  async function updateEMAPattern() {
    const ema10 = parseFloat(document.getElementById('input-ema10').value);
    const ema21 = parseFloat(document.getElementById('input-ema21').value);
    const ema100 = parseFloat(document.getElementById('input-ema100').value);

    if (!ema10 || !ema21 || !ema100) {
      alert('Please enter all three EMA values');
      return;
    }

    emaAnalysis = EMAAnalyzer.analyze(ema10, ema21, ema100);

    if (!emaAnalysis.valid) {
      alert(emaAnalysis.error);
      return;
    }

    // Update relationships
    document.querySelector('#ema-10-21 span').textContent = ema10 > ema21 ? '10 > 21 ✓' : '10 < 21 ✓';
    document.querySelector('#ema-both-100 span').textContent =
      ema10 > ema100 && ema21 > ema100 ? 'Both > 100 ✓' :
        ema10 < ema100 && ema21 < ema100 ? 'Both < 100 ✓' : 'Mixed';

    // Update badge
    const badge = document.getElementById('pattern-badge');
    badge.textContent = `${emaAnalysis.icon} ${emaAnalysis.pattern.toUpperCase()}`;
    badge.style.background = emaAnalysis.color + '33';
    badge.style.color = emaAnalysis.color;

    // Update recommendation
    document.getElementById('pattern-recommendation').textContent = emaAnalysis.recommendation;
    document.getElementById('pattern-warning').textContent = emaAnalysis.warning || '';

    // Update timestamp
    document.getElementById('ema-last-updated').textContent = `Updated: ${new Date().toLocaleTimeString('en-IN')}`;

    await updateValidation();
  }

  /**
   * Update RSI validation
   */
  async function updateRSIValidation() {
    const rsi = parseFloat(document.getElementById('input-rsi').value);

    if (isNaN(rsi) || rsi < 0 || rsi > 100) {
      alert('Please enter a valid RSI value (0-100)');
      return;
    }

    if (!trendBias) {
      alert('Please update trend bias first');
      return;
    }

    rsiValidation = RSIValidator.validate(rsi, trendBias.bias);

    // Update value display
    document.getElementById('rsi-value').textContent = rsi;

    // Update marker position
    const marker = document.getElementById('rsi-marker');
    marker.style.left = `${rsi}%`;
    marker.style.display = 'block';

    // Update status
    const status = document.getElementById('rsi-status');
    status.className = `tide-status tide-status-${rsiValidation.aligned ? 'success' : 'warning'}`;
    status.innerHTML = `<span>${rsiValidation.icon}</span><span>${rsiValidation.status}</span>`;

    document.getElementById('rsi-message').textContent = rsiValidation.message;
    document.getElementById('rsi-warning').textContent = rsiValidation.warning || '';

    await updateValidation();
  }

  /**
   * Update validation and button states
   */
  async function updateValidation() {
    // Refresh data
    currentData = await StorageManager.getData();
    const session = currentData.currentSession;
    const settings = currentData.settings;

    // Update counter
    document.getElementById('counter-count').textContent = session.tradesCount;
    document.getElementById('counter-max').textContent = settings.maxTradesPerDay;

    const counter = document.getElementById('trade-counter');
    if (session.tradesCount >= settings.maxTradesPerDay) {
      counter.className = 'tide-counter tide-red tide-flash';
    } else if (session.tradesCount >= settings.maxTradesPerDay - 1) {
      counter.className = 'tide-counter tide-yellow';
    } else {
      counter.className = 'tide-counter tide-green';
    }

    // Update time check
    timeCheck = TimeChecker.checkTradingWindow(settings.tradingWindows);
    document.getElementById('current-time').textContent = timeCheck.currentTime;

    const timeStatus = document.getElementById('time-status');
    if (timeCheck.inWindow) {
      timeStatus.className = 'tide-status tide-status-success';
      timeStatus.innerHTML = `<span>✅</span><span>In ${timeCheck.session} session</span>`;
    } else {
      timeStatus.className = 'tide-status tide-status-error';
      timeStatus.innerHTML = `<span>🔴</span><span>${timeCheck.message}</span>`;
    }

    // Run validation
    const validation = TradeValidator.validate({
      tradesCount: session.tradesCount,
      maxTrades: settings.maxTradesPerDay,
      timeCheck,
      emaAnalysis,
      rsiValidation,
      pullbackConfirmed
    });

    // Update rules display
    updateRuleDisplay(validation);

    // Update button
    const confirmBtn = document.getElementById('btn-confirm-trade');
    const btnStyle = TradeValidator.getButtonStyle(validation.buttonState);

    Object.assign(confirmBtn.style, {
      backgroundColor: btnStyle.backgroundColor,
      color: btnStyle.color,
      cursor: btnStyle.cursor,
      opacity: btnStyle.opacity
    });
    confirmBtn.disabled = btnStyle.disabled;

    if (!validation.canTrade) {
      confirmBtn.textContent = `🔴 ${validation.primaryReason}`;
    } else if (validation.buttonState === 'WARNING') {
      confirmBtn.textContent = `⚠️ ${validation.primaryReason}`;
      confirmBtn.className = 'tide-button tide-button-warning';
    } else {
      confirmBtn.textContent = '🟢 CONFIRM TRADE';
      confirmBtn.className = 'tide-button tide-button-primary';
    }

    // Update last trade info
    if (session.trades.length > 0) {
      const lastTrade = session.trades[session.trades.length - 1];
      const time = new Date(lastTrade.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      });
      document.getElementById('last-trade-info').textContent =
        `Last Trade: ${time} - ${lastTrade.symbol} ${lastTrade.action}`;
    }
  }

  /**
   * Update validation rules display
   */
  function updateRuleDisplay(validation) {
    validation.rules.forEach(rule => {
      const elem = document.getElementById(`rule-${rule.id.toLowerCase().replace('_', '-')}`);
      if (elem) {
        elem.textContent = `${rule.icon} ${rule.name}`;
      }
    });
  }

  /**
   * Confirm trade
   */
  async function confirmTrade() {
    if (!emaAnalysis || !rsiValidation) {
      alert('Please analyze EMA pattern and RSI first');
      return;
    }

    // Get symbol from user
    const symbol = prompt('Enter stock symbol (e.g., RELIANCE):');
    if (!symbol) return;

    const action = trendBias && trendBias.bias === 'BULLISH' ? 'BUY' : 'SELL';
    const entryReason = prompt('Entry reason (why this trade?):') || 'Pattern setup';

    try {
      const result = await StorageManager.incrementTradeCount(
        JournalManager.createTradeEntry({
          symbol: symbol.toUpperCase(),
          action,
          entryReason,
          emaPattern: emaAnalysis.pattern,
          emaValues: emaAnalysis.emaValues,
          rsiValue: rsiValidation.rsi
        })
      );

      alert(`✅ Trade logged! ${result.tradesRemaining} trade(s) remaining today`);

      // Show encouragement
      if (result.tradesRemaining === 0) {
        alert('🌊 Max trades reached! Great discipline. See you tomorrow!');
      } else if (result.tradesRemaining === 1) {
        alert('⚠️ LAST TRADE AVAILABLE - Use it wisely!');
      }

      await updateAllSections();
      await loadJournalEntries();
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }

  /**
   * Skip trade
   */
  async function skipTrade() {
    const symbol = prompt('Stock symbol you\'re skipping (optional):') || 'N/A';
    const reason = prompt('Why skipping?') || 'Outside criteria';

    await StorageManager.addSkippedSetup(
      JournalManager.createSkipEntry({
        symbol: symbol.toUpperCase(),
        reason
      })
    );

    alert('🌊 Good discipline! Setup skipped and logged.');
    await loadJournalEntries();
  }

  /**
   * Save manual note
   */
  async function saveNote() {
    const note = document.getElementById('input-note').value.trim();

    if (!note) {
      alert('Please enter a note');
      return;
    }

    await StorageManager.addJournalEntry(
      JournalManager.createNoteEntry(note)
    );

    document.getElementById('input-note').value = '';
    alert('💾 Note saved!');
    await loadJournalEntries();
  }

  /**
   * Export journal
   */
  async function exportJournal() {
    const csv = await StorageManager.exportJournal();

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TIDE-Journal-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    alert('📋 Journal exported!');
  }

  /**
   * Load journal entries
   */
  async function loadJournalEntries() {
    const entries = await StorageManager.getJournalEntries();
    const recentEntries = JournalManager.getRecent(entries, 5);

    const container = document.getElementById('journal-entries');

    if (recentEntries.length === 0) {
      container.innerHTML = '<div class="tide-gray tide-text-center" style="padding: 20px;">No entries yet</div>';
      return;
    }

    container.innerHTML = recentEntries.map(entry => {
      const formatted = JournalManager.formatEntryForDisplay(entry);
      return `
        <div class="tide-journal-entry">
          <div class="tide-journal-header">
            <span>${formatted.icon}</span>
            <span>${formatted.dateStr}, ${formatted.timeStr}</span>
          </div>
          <div class="tide-journal-title">${formatted.title}</div>
          <div class="tide-journal-subtitle">${formatted.subtitle}</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Update all sections
   */
  async function updateAllSections() {
    await updateValidation();
    await loadJournalEntries();

    // Update time every minute
    setInterval(() => {
      if (currentData) {
        timeCheck = TimeChecker.checkTradingWindow(currentData.settings.tradingWindows);
        document.getElementById('current-time').textContent = timeCheck.currentTime;
      }
    }, 60000);
  }

  // Initialize when DOM is ready (with error protection)
  function safeInit() {
    try {
      initTIDE();
    } catch (error) {
      console.error('TIDE initialization failed:', error);
      // Don't crash the page - extension will not load but page works
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', safeInit);
  } else {
    // Small delay to ensure page is stable
    setTimeout(safeInit, 200);
  }
})();

/**
 * Gandhi Jayanti Challenge - Secure Anti-Cheating & Admin Engine
 * Features:
 * - Window Focus & Visibility Guard (Detects Tab switch, Minimization, Gemini / Circle to Search overlay)
 * - Single-Attempt Device Lock (Redirects on reload with final score)
 * - Password-Protected Admin Dashboard (PIN: 1861)
 * - 18+ Question Randomization with Option Shuffling
 * - Elimination without re-attempt
 * - Web Audio API Synthesizer
 * - CSV Leaderboard Export
 */

// Web Audio API Synthesizer
class SoundEffects {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('gj_muted') === 'true';
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq, type, duration, delay = 0, gainLevel = 0.15) {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(gainLevel, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {}
    }, delay);
  }

  click() { this.playTone(600, 'sine', 0.05, 0, 0.08); }

  correct() {
    this.playTone(523.25, 'triangle', 0.15, 0, 0.2);
    this.playTone(659.25, 'triangle', 0.15, 90, 0.2);
    this.playTone(783.99, 'triangle', 0.25, 180, 0.2);
  }

  wrong() {
    this.playTone(220, 'sawtooth', 0.18, 0, 0.15);
    this.playTone(180, 'sawtooth', 0.25, 120, 0.15);
  }

  tick() { this.playTone(800, 'sine', 0.03, 0, 0.05); }

  stagePass() {
    this.playTone(440, 'triangle', 0.15, 0, 0.2);
    this.playTone(554.37, 'triangle', 0.15, 100, 0.2);
    this.playTone(659.25, 'triangle', 0.15, 200, 0.2);
    this.playTone(880, 'triangle', 0.35, 300, 0.25);
  }

  alarm() {
    this.playTone(400, 'square', 0.2, 0, 0.3);
    this.playTone(250, 'square', 0.3, 180, 0.3);
  }

  victory() {
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.2, i * 110, 0.2);
    });
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem('gj_muted', this.muted);
    return this.muted;
  }
}

const sfx = new SoundEffects();

// MASTER QUESTION BANK (18 Historical Questions on Mahatma Gandhi)
const MASTER_TRIVIA_BANK = [
  {
    q: "Where was Mahatma Gandhi born on October 2, 1869?",
    options: ["Porbandar, Gujarat", "Rajkot, Gujarat", "Ahmedabad, Gujarat", "Surat, Gujarat"],
    answer: 0,
    fact: "Porbandar, Gujarat was the coastal birthplace of Mohandas Karamchand Gandhi."
  },
  {
    q: "What is the core philosophical meaning of Gandhi's coined term 'Satyagraha'?",
    options: ["Soul force / Insistence on Truth", "Passive compliance", "Armed self-defense", "Economic boycott only"],
    answer: 0,
    fact: "Gandhi defined Satyagraha as 'Truth-Force' or 'Soul-Force' — active, fearless non-violent resistance."
  },
  {
    q: "In which historic year did Gandhi lead the 240-mile Salt March from Sabarmati to Dandi?",
    options: ["1930", "1920", "1942", "1919"],
    answer: 0,
    fact: "The Salt March began on March 12, 1930, reaching Dandi on April 6, 1930, to break the colonial salt monopoly."
  },
  {
    q: "What is the title of Mahatma Gandhi's world-famous autobiography?",
    options: ["The Story of My Experiments with Truth", "My Life, My Message", "Discovery of India", "Hind Swaraj"],
    answer: 0,
    fact: "Written in Gujarati while imprisoned in Yerwada Jail, it details his formative spiritual experiments."
  },
  {
    q: "What international observance was declared by the UN General Assembly on Gandhi's birthday, Oct 2?",
    options: ["International Day of Non-Violence", "World Peace Day", "Global Harmony Day", "Universal Human Rights Day"],
    answer: 0,
    fact: "In 2007, the United Nations unanimously designated October 2 as the International Day of Non-Violence."
  },
  {
    q: "Which movement launched by Gandhi in August 1942 gave the clarion call 'Do or Die' ('Karo ya Maro')?",
    options: ["Quit India Movement", "Non-Cooperation Movement", "Champaran Satyagraha", "Swadeshi Movement"],
    answer: 0,
    fact: "At the Gowalia Tank Maidan in Mumbai, Gandhi proclaimed: 'We shall either free India or die in the attempt.'"
  },
  {
    q: "In 1917, Gandhi launched his first major Satyagraha in India to defend indigo farmers in which district?",
    options: ["Champaran, Bihar", "Kheda, Gujarat", "Bardoli, Gujarat", "Amritsar, Punjab"],
    answer: 0,
    fact: "Champaran was Gandhi's first Satyagraha on Indian soil, challenging the exploitative Tinkathia system."
  },
  {
    q: "At which railway station in South Africa was Gandhi forcibly ejected from a train in 1893?",
    options: ["Pietermaritzburg", "Johannesburg", "Durban", "Pretoria"],
    answer: 0,
    fact: "The cold night at Pietermaritzburg railway station was the turning point that sparked his civil rights struggle."
  },
  {
    q: "What does the Gandhian social philosophy of 'Sarvodaya' signify?",
    options: ["Welfare and upliftment of all", "Political dominance", "Rapid industrial expansion", "Urbanization"],
    answer: 0,
    fact: "Sarvodaya signifies 'Universal Uplift' or 'Progress of All', inspired by John Ruskin's 'Unto This Last'."
  },
  {
    q: "On the banks of which river did Gandhi establish his historic ashram in Ahmedabad in 1917?",
    options: ["Sabarmati River", "Narmada River", "Yamuna River", "Ganges River"],
    answer: 0,
    fact: "Sabarmati Ashram served as the nerve center for India's freedom struggle for over a decade."
  },
  {
    q: "Who conferred the revered title 'Mahatma' (Great Soul) upon Mohandas Karamchand Gandhi?",
    options: ["Rabindranath Tagore", "Subhash Chandra Bose", "Gopal Krishna Gokhale", "Bal Gangadhar Tilak"],
    answer: 0,
    fact: "Nobel laureate Rabindranath Tagore popularized the title 'Mahatma' upon Gandhi's return to India in 1915."
  },
  {
    q: "Which communal settlement did Gandhi establish near Durban in 1904 to practice simplicity and printing?",
    options: ["Phoenix Settlement", "Tolstoy Farm", "Sabarmati Ashram", "Sevagram"],
    answer: 0,
    fact: "Phoenix Settlement was Gandhi's first cooperative commune, publishing the 'Indian Opinion' newspaper."
  },
  {
    q: "Named after the Russian philosopher who deeply influenced Gandhi, what community was founded in South Africa in 1910?",
    options: ["Tolstoy Farm", "Ruskin Farm", "Thoreau Settlement", "Gokhale Commune"],
    answer: 0,
    fact: "Tolstoy Farm provided shelter and training for the families of Satyagrahis in South Africa."
  },
  {
    q: "Why did Gandhi advocate spinning on the Charkha as a central symbol of Swadeshi?",
    options: ["To foster economic self-reliance & rural employment", "To eliminate modern technology completely", "Only as physical exercise", "For religious rituals"],
    answer: 0,
    fact: "The Charkha was the engine of self-sufficiency, uniting millions of rural Indians against foreign mill dependence."
  },
  {
    q: "In which 1909 seminal work did Gandhi articulate his critique of industrial civilization and vision of self-rule?",
    options: ["Hind Swaraj (Indian Home Rule)", "The Essential Gandhi", "Constructive Programme", "India of My Dreams"],
    answer: 0,
    fact: "Gandhi penned 'Hind Swaraj' aboard the ship SS Kildonan Castle during his voyage from London to South Africa."
  },
  {
    q: "In 1918, Gandhi organized a non-violent tax-withholding campaign for famine-stricken peasants in which Gujarat district?",
    options: ["Kheda", "Surat", "Rajkot", "Vadodara"],
    answer: 0,
    fact: "The Kheda Satyagraha united peasant farmers when colonial authorities refused revenue suspension during crop failure."
  },
  {
    q: "Why did Gandhi abruptly suspend the nationwide Non-Cooperation Movement in February 1922?",
    options: ["Violent clash at Chauri Chaura", "British government conceded all demands", "Lack of funds", "Outbreak of plague"],
    answer: 0,
    fact: "Following violence at Chauri Chaura where a police post was torched, Gandhi fasted and suspended the movement to preserve strict Ahimsa."
  },
  {
    q: "Which essay by Henry David Thoreau deeply reinforced Gandhi's concept of civil disobedience?",
    options: ["Civil Disobedience", "Walden", "Self-Reliance", "Common Sense"],
    answer: 0,
    fact: "Thoreau's essay confirmed Gandhi's belief in the ethical duty of citizens to refuse cooperation with unjust laws."
  }
];

// Round 2 Puzzles: Quotes & Principles
const PUZZLE_DATA = [
  {
    id: 1,
    title: 'Puzzle 1: Arrange Gandhi\'s World-Famous Quote',
    instruction: 'Tap blocks to swap, or use arrows to order this iconic quote correctly:',
    correctOrder: [
      "Be the change",
      "that you wish",
      "to see",
      "in the world"
    ],
    scrambled: [
      "to see",
      "Be the change",
      "in the world",
      "that you wish"
    ]
  },
  {
    id: 2,
    title: 'Puzzle 2: Order Core Principles by Priority',
    instruction: 'Sequence the four cardinal pillars of Gandhian philosophy:',
    correctOrder: [
      "1. Ahimsa (Universal Non-Violence)",
      "2. Satyagraha (Soul Force of Truth)",
      "3. Swadeshi (Self-Reliance & Local Craft)",
      "4. Sarvodaya (Upliftment of All)"
    ],
    scrambled: [
      "3. Swadeshi (Self-Reliance & Local Craft)",
      "1. Ahimsa (Universal Non-Violence)",
      "4. Sarvodaya (Upliftment of All)",
      "2. Satyagraha (Soul Force of Truth)"
    ]
  },
  {
    id: 3,
    title: 'Puzzle 3: The Power of Gentleness',
    instruction: 'Order the wisdom words about shaping human history peacefully:',
    correctOrder: [
      "In a gentle way,",
      "you can",
      "shake the",
      "entire world."
    ],
    scrambled: [
      "entire world.",
      "In a gentle way,",
      "shake the",
      "you can"
    ]
  }
];

// Round 3 Dandi March Route Historical Stops
const DANDI_STOPS = [
  { id: 'sabarmati', num: 1, name: 'Sabarmati Ashram', city: 'Ahmedabad', date: 'March 12, 1930', info: 'Bapu began the 240-mile journey with 78 chosen satyagrahis.', coords: { x: 50, y: 30 } },
  { id: 'aslali', num: 2, name: 'Aslali', city: 'Ahmedabad dist.', date: 'March 12, 1930', info: 'First night halt. Gandhi vowed never to return until Swaraj was won.', coords: { x: 55, y: 60 } },
  { id: 'nadiad', num: 3, name: 'Nadiad', city: 'Kheda', date: 'March 15, 1930', info: '200+ local village officials resigned their government posts in solidarity.', coords: { x: 62, y: 95 } },
  { id: 'anand', num: 4, name: 'Anand', city: 'Anand', date: 'March 17, 1930', info: 'Welcomed by 20,000 citizens; Charotar youth joined the vanguard.', coords: { x: 70, y: 130 } },
  { id: 'kanakapura', num: 5, name: 'Kanakapura (Mahi River)', city: 'Mahi Estuary', date: 'March 19, 1930', info: 'Epic midnight crossing of the muddy Mahi river under torchlight.', coords: { x: 65, y: 165 } },
  { id: 'bhatgam', num: 6, name: 'Bhatgam', city: 'Surat dist.', date: 'March 29, 1930', info: 'Gandhi delivered his sermon on simplicity and self-purification.', coords: { x: 60, y: 198 } },
  { id: 'navsari', num: 7, name: 'Navsari', city: 'Navsari', date: 'April 4, 1930', info: 'Final assembly before marching onto the salt flats of the Arabian Sea.', coords: { x: 55, y: 225 } },
  { id: 'dandi', num: 8, name: 'Dandi Beach', city: 'Navsari Coast', date: 'April 6, 1930', info: 'Gandhi picked up a lump of natural salt, breaking the British monopoly!', coords: { x: 45, y: 245 } }
];

// Application State
const state = {
  playerName: '',
  currentScreen: 'screen-welcome',
  examInProgress: false,
  cheatWarnings: 0,
  footerClicks: 0,
  startTime: null,
  
  // Scores
  round1Score: 0,
  round2Score: 0,
  round3Score: 0,
  totalScore: 0,
  
  // Round 1
  r1Questions: [],
  r1CurrentIndex: 0,
  r1CorrectCount: 0,
  r1TimerSeconds: 15,
  r1TimerInterval: null,
  
  // Round 2
  r2Puzzles: [],
  r2CurrentIndex: 0,
  r2SolvedCount: 0,
  r2TimerSeconds: 60,
  r2TimerInterval: null,
  r2SelectedBlockIndex: null,
  
  // Round 3
  r3CurrentStopIndex: 0,
  r3TimerInterval: null,
  r3SecondsElapsed: 0,
  r3Mistakes: 0,
  r3Streak: 0,
  
  audioMuted: false
};

// ==========================================
// INITIALIZATION & SINGLE-ATTEMPT LOCK CHECK
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initStorage();
  checkSingleAttemptLock();
  bindSecurityListeners();
  bindEvents();
  renderWelcomeQuotes();
});

function initStorage() {
  const savedName = localStorage.getItem('gj_player_name');
  if (savedName) {
    state.playerName = savedName;
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = savedName;
  }

  state.audioMuted = localStorage.getItem('gj_muted') === 'true';
  updateSoundButtonUI();
}

/**
 * Single-Attempt Lock:
 * Redirects immediately if the device has already attempted or completed.
 */
function checkSingleAttemptLock() {
  const isDisqualified = localStorage.getItem('gj_lock_disqualified') === 'true';
  const isCompleted = localStorage.getItem('gj_lock_completed') === 'true';
  const isAttempted = localStorage.getItem('gj_lock_attempted') === 'true';

  if (isDisqualified) {
    state.examInProgress = false;
    showDisqualifiedScreen("Screen focus lost or application minimized during active competition.");
    return true;
  }

  if (isCompleted || isAttempted) {
    state.examInProgress = false;
    const lockedScore = parseInt(localStorage.getItem('gj_lock_score') || '0', 10);
    const lockedName = localStorage.getItem('gj_lock_name') || state.playerName || 'Player';
    const lockedStatus = localStorage.getItem('gj_lock_status') || 'Completed';

    showLockedScreen(lockedName, lockedScore, lockedStatus);
    return true;
  }

  return false;
}

function showLockedScreen(name, score, statusDesc) {
  showScreen('screen-locked');
  document.getElementById('locked-player-name').textContent = name;
  document.getElementById('locked-score-highlight').textContent = `${score} pts`;
  document.getElementById('locked-status-badge').textContent = statusDesc;

  document.getElementById('locked-share-btn')?.addEventListener('click', () => {
    state.totalScore = score;
    shareOnWhatsApp();
  });
}

function showDisqualifiedScreen(reason) {
  showScreen('screen-disqualified');
  document.getElementById('disqualified-reason').textContent = reason;
}

// ==========================================
// ANTI-CHEATING & SCREEN OVERLAY PROTECTION
// ==========================================

function bindSecurityListeners() {
  // 1. Prevent Right-Click
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showToast('⚠️ Right-click is disabled to preserve competition integrity.');
    return false;
  });

  // 2. Prevent Copy, Cut, Paste
  ['copy', 'cut', 'paste'].forEach(evt => {
    document.addEventListener(evt, (e) => {
      e.preventDefault();
      showToast('⚠️ Copying or pasting text is strictly prohibited.');
      return false;
    });
  });

  // 3. Prevent Copy & Inspection Shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase()))) {
      e.preventDefault();
      showToast('⚠️ Developer inspection tools are prohibited.');
      return false;
    }

    if (e.ctrlKey || e.metaKey) {
      const k = e.key.toLowerCase();
      if (['c', 'u', 's', 'a', 'p'].includes(k)) {
        e.preventDefault();
        showToast('⚠️ Action disabled to enforce competition integrity.');
        return false;
      }
    }
  });

  // 4. Window Focus & Visibility Guard (Detects Tab switch, Minimization, Gemini / Circle to Search)
  document.addEventListener('visibilitychange', handleFocusLossOrOverlay);
  window.addEventListener('blur', handleFocusLossOrOverlay);
}

let focusLossDebounce = null;
function handleFocusLossOrOverlay() {
  if (!state.examInProgress) return;

  // Debounce to prevent duplicate triggers from simultaneous blur and visibilitychange
  if (focusLossDebounce) return;
  focusLossDebounce = setTimeout(() => {
    focusLossDebounce = null;
  }, 1000);

  state.cheatWarnings++;
  localStorage.setItem('gj_cheat_warnings', state.cheatWarnings.toString());

  if (state.cheatWarnings === 1) {
    // 1st Violation: Full screen alert banner
    sfx.alarm();
    const modal = document.getElementById('screen-focus-alert-modal');
    if (modal) modal.classList.add('active');
  } else if (state.cheatWarnings >= 2) {
    // 2nd Violation (or during live timer): Instant 0 score, Disqualification & Device Lock!
    terminateDueToCheating();
  }
}

function acknowledgeFocusAlert() {
  sfx.click();
  const modal = document.getElementById('screen-focus-alert-modal');
  if (modal) modal.classList.remove('active');
  showToast('⚠️ Resumed. Next focus loss will immediately result in an instant zero score.');
}

function terminateDueToCheating() {
  state.examInProgress = false;
  clearInterval(state.r1TimerInterval);
  clearInterval(state.r2TimerInterval);
  clearInterval(state.r3TimerInterval);

  sfx.alarm();
  // Set Round and Total score to 0 on disqualification
  state.round1Score = 0;
  state.round2Score = 0;
  state.round3Score = 0;
  state.totalScore = 0;

  localStorage.setItem('gj_lock_disqualified', 'true');
  localStorage.setItem('gj_lock_completed', 'true');
  localStorage.setItem('gj_lock_score', '0');
  localStorage.setItem('gj_lock_status', 'Disqualified for Overlay / Tab Switch');

  saveToLeaderboard(state.playerName, 0, 'Disqualified');

  const modal = document.getElementById('screen-focus-alert-modal');
  if (modal) modal.classList.remove('active');

  showDisqualifiedScreen("Screen focus lost or overlay detected twice during active examination. Your score has been set to 0 and your session is permanently locked.");
}

// ==========================================
// SECRET ADMIN DASHBOARD (PIN PROTECTED)
// ==========================================

function handleFooterTriggerClick() {
  state.footerClicks++;
  if (state.footerClicks >= 3) {
    state.footerClicks = 0;
    openAdminLoginModal();
  }
}

function openAdminLoginModal() {
  sfx.click();
  const modal = document.getElementById('admin-login-modal');
  const pinInput = document.getElementById('admin-pin-input');
  if (pinInput) pinInput.value = '';
  const err = document.getElementById('admin-pin-error');
  if (err) err.style.display = 'none';
  if (modal) modal.classList.add('active');
}

function closeAdminLoginModal() {
  sfx.click();
  document.getElementById('admin-login-modal')?.classList.remove('active');
}

function verifyAdminPin() {
  const pinInput = document.getElementById('admin-pin-input');
  const enteredPin = pinInput.value.trim();
  const err = document.getElementById('admin-pin-error');

  // Accepted PINs: '1861' (default) or 'bapu1869'
  if (enteredPin === '1861' || enteredPin.toLowerCase() === 'bapu1869') {
    sfx.stagePass();
    closeAdminLoginModal();
    openAdminDashboard();
  } else {
    sfx.wrong();
    if (err) {
      err.textContent = 'Invalid PIN code. Access denied.';
      err.style.display = 'block';
    }
  }
}

function openAdminDashboard() {
  renderAdminTable();
  const modal = document.getElementById('admin-panel-modal');
  if (modal) modal.classList.add('active');
}

function closeAdminDashboard() {
  sfx.click();
  document.getElementById('admin-panel-modal')?.classList.remove('active');
}

function renderAdminTable() {
  const list = JSON.parse(localStorage.getItem('gj_leaderboard_v1') || '[]');
  const tbody = document.getElementById('admin-table-body');
  if (!tbody) return;

  tbody.innerHTML = '';
  document.getElementById('admin-total-players').textContent = list.length;

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:18px; color:#888;">No player attempts recorded yet.</td></tr>`;
    return;
  }

  list.forEach((item, index) => {
    const tr = document.createElement('tr');
    let badgeClass = 'pass';
    if (item.status === 'Disqualified') badgeClass = 'disq';
    else if (item.status && item.status.includes('Eliminated')) badgeClass = 'fail';

    tr.innerHTML = `
      <td><strong>${index + 1}</strong></td>
      <td><strong>${item.name || 'Anonymous'}</strong></td>
      <td>${item.r1 || 0}</td>
      <td>${item.r2 || 0}</td>
      <td>${item.r3 || 0}</td>
      <td><strong style="color:var(--color-saffron);">${item.score || 0}</strong></td>
      <td><span class="admin-badge ${badgeClass}">${item.status || 'Completed'}</span></td>
      <td>
        <button class="block-move-btn" style="width:auto; padding:2px 8px; font-size:10px; color:#C83E4D;" onclick="adminDeletePlayer(${index})">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Global Admin Actions
window.adminDeletePlayer = function(index) {
  if (confirm("Delete this player record?")) {
    let list = JSON.parse(localStorage.getItem('gj_leaderboard_v1') || '[]');
    list.splice(index, 1);
    localStorage.setItem('gj_leaderboard_v1', JSON.stringify(list));
    renderAdminTable();
    showToast("Record removed.");
  }
};

function adminUnlockThisDevice() {
  if (confirm("Clear device lockout flags? This will allow a fresh attempt on this device.")) {
    localStorage.removeItem('gj_lock_attempted');
    localStorage.removeItem('gj_lock_completed');
    localStorage.removeItem('gj_lock_disqualified');
    localStorage.removeItem('gj_lock_score');
    localStorage.removeItem('gj_lock_name');
    localStorage.removeItem('gj_lock_status');
    localStorage.removeItem('gj_cheat_warnings');
    sessionStorage.clear();
    alert("✅ Device unlocked! Reloading to welcome page...");
    window.location.reload();
  }
}

function adminClearAllLeaderboard() {
  if (confirm("WARNING: This will permanently purge all scores from the leaderboard. Proceed?")) {
    localStorage.removeItem('gj_leaderboard_v1');
    renderAdminTable();
    showToast("Leaderboard cleared.");
  }
}

function adminExportCSV() {
  const list = JSON.parse(localStorage.getItem('gj_leaderboard_v1') || '[]');
  if (list.length === 0) {
    alert("No records to export.");
    return;
  }

  let csv = "Rank,Player Name,Round 1,Round 2,Round 3,Total Score,Status,Date\n";
  list.forEach((p, idx) => {
    csv += `"${idx + 1}","${p.name || ''}",${p.r1 || 0},${p.r2 || 0},${p.r3 || 0},${p.score || 0},"${p.status || 'Completed'}","${p.date || ''}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `gandhi_jayanti_leaderboard_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// CORE EVENTS & NAVIGATION
// ==========================================

function bindEvents() {
  // Footer secret trigger (click 3 times)
  document.getElementById('admin-secret-trigger')?.addEventListener('click', handleFooterTriggerClick);

  // Admin login bindings
  document.getElementById('admin-pin-submit-btn')?.addEventListener('click', verifyAdminPin);
  document.getElementById('admin-pin-close-btn')?.addEventListener('click', closeAdminLoginModal);
  document.getElementById('admin-pin-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') verifyAdminPin();
  });

  // Admin dashboard controls
  document.getElementById('admin-panel-close-btn')?.addEventListener('click', closeAdminDashboard);
  document.getElementById('admin-unlock-device-btn')?.addEventListener('click', adminUnlockThisDevice);
  document.getElementById('admin-clear-lb-btn')?.addEventListener('click', adminClearAllLeaderboard);
  document.getElementById('admin-export-csv-btn')?.addEventListener('click', adminExportCSV);

  // Anti-cheat alert acknowledge
  document.getElementById('focus-alert-ack-btn')?.addEventListener('click', acknowledgeFocusAlert);

  // Sound toggle
  document.getElementById('sound-toggle-btn')?.addEventListener('click', () => {
    state.audioMuted = sfx.toggleMute();
    updateSoundButtonUI();
    showToast(state.audioMuted ? 'Sound muted' : 'Sound enabled');
  });

  // Start Challenge
  document.getElementById('start-btn')?.addEventListener('click', handleStartChallenge);
  document.getElementById('player-name-input')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleStartChallenge();
  });

  // Transitions
  document.getElementById('r1-advance-btn')?.addEventListener('click', () => {
    sfx.click();
    startRound2();
  });
  document.getElementById('r2-advance-btn')?.addEventListener('click', () => {
    sfx.click();
    startRound3();
  });

  // Certificate & Share
  document.getElementById('view-cert-btn')?.addEventListener('click', showCertificateModal);
  document.getElementById('close-cert-btn')?.addEventListener('click', hideCertificateModal);
  document.getElementById('share-whatsapp-btn')?.addEventListener('click', shareOnWhatsApp);
  document.getElementById('copy-link-btn')?.addEventListener('click', copyShareLink);
}

function updateSoundButtonUI() {
  const soundBtn = document.getElementById('sound-toggle-btn');
  if (!soundBtn) return;
  soundBtn.innerHTML = state.audioMuted ? '🔇' : '🔔';
}

function showScreen(screenId) {
  state.currentScreen = screenId;
  document.querySelectorAll('.game-screen').forEach(el => {
    el.classList.remove('active');
  });
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function showToast(message) {
  let toast = document.getElementById('toast-container');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-container';
    toast.className = 'toast-msg';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span>${message}</span>`;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function renderWelcomeQuotes() {
  const quotes = [
    { text: "Be the change that you wish to see in the world.", author: "Mahatma Gandhi" },
    { text: "In a gentle way, you can shake the world.", author: "Mahatma Gandhi" },
    { text: "Truth resides in every human heart, and one has to search for it there.", author: "Mahatma Gandhi" }
  ];
  const q = quotes[Math.floor(Math.random() * quotes.length)];
  const box = document.getElementById('welcome-quote-box');
  if (box) {
    box.innerHTML = `"${q.text}" <div class="quote-author">— ${q.author}</div>`;
  }
}

// ==========================================
// START CHALLENGE & LOCK DEVICE
// ==========================================

function handleStartChallenge() {
  const nameInput = document.getElementById('player-name-input');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.focus();
    showToast('Please enter your name to start!');
    sfx.wrong();
    return;
  }

  state.playerName = name;
  sfx.click();

  // LOCK ATTEMPT: Mark device as attempted immediately
  localStorage.setItem('gj_lock_attempted', 'true');
  localStorage.setItem('gj_lock_name', name);
  localStorage.setItem('gj_lock_status', 'In Progress');
  sessionStorage.setItem('gj_active_session', 'true');

  state.round1Score = 0;
  state.round2Score = 0;
  state.round3Score = 0;
  state.totalScore = 0;
  state.cheatWarnings = 0;
  state.startTime = new Date();

  startRound1();
}

// ==========================================
// ROUND 1: TRIVIA (5 RANDOM QUESTIONS)
// ==========================================

function startRound1() {
  state.examInProgress = true;
  clearInterval(state.r1TimerInterval);

  // 1. Pick 5 distinct questions randomly from the 18+ pool
  const shuffledPool = [...MASTER_TRIVIA_BANK].sort(() => 0.5 - Math.random());
  const selectedFive = shuffledPool.slice(0, 5);

  // 2. Randomize option order (A, B, C, D) for each question
  state.r1Questions = selectedFive.map(qObj => {
    const correctText = qObj.options[qObj.answer];
    const shuffledOptions = [...qObj.options].sort(() => 0.5 - Math.random());
    const newAnswerIdx = shuffledOptions.indexOf(correctText);
    return {
      q: qObj.q,
      options: shuffledOptions,
      answer: newAnswerIdx,
      fact: qObj.fact
    };
  });

  state.r1CurrentIndex = 0;
  state.r1CorrectCount = 0;
  state.round1Score = 0;

  showScreen('screen-round1');
  renderRound1Question();
}

function renderRound1Question() {
  clearInterval(state.r1TimerInterval);
  const qObj = state.r1Questions[state.r1CurrentIndex];
  if (!qObj) return;

  document.getElementById('r1-hud-user').textContent = state.playerName;
  document.getElementById('r1-hud-qnum').textContent = `${state.r1CurrentIndex + 1}/5`;
  document.getElementById('r1-hud-score').textContent = `${state.round1Score} pts`;
  document.getElementById('r1-progress').style.width = `${((state.r1CurrentIndex) / 5) * 100}%`;

  document.getElementById('r1-question-text').textContent = qObj.q;
  const factBox = document.getElementById('r1-fact-box');
  factBox.style.display = 'none';
  factBox.textContent = '';

  const optionsContainer = document.getElementById('r1-options-container');
  optionsContainer.innerHTML = '';
  const optionLabels = ['A', 'B', 'C', 'D'];

  qObj.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `
      <span class="option-key">${optionLabels[idx]}</span>
      <span class="option-label">${opt}</span>
    `;
    btn.addEventListener('click', () => handleOptionSelect(idx, btn));
    optionsContainer.appendChild(btn);
  });

  // Strict 15-second countdown timer per question
  state.r1TimerSeconds = 15;
  updateR1TimerDisplay();

  state.r1TimerInterval = setInterval(() => {
    state.r1TimerSeconds--;
    updateR1TimerDisplay();

    if (state.r1TimerSeconds <= 4 && state.r1TimerSeconds > 0) {
      sfx.tick();
    }

    if (state.r1TimerSeconds <= 0) {
      clearInterval(state.r1TimerInterval);
      handleQuestionTimeout();
    }
  }, 1000);
}

function updateR1TimerDisplay() {
  const timerVal = document.getElementById('r1-timer-num');
  const ringFill = document.getElementById('r1-ring-fill');
  if (timerVal) timerVal.textContent = state.r1TimerSeconds;

  const totalOffset = 100;
  const fraction = state.r1TimerSeconds / 15;
  const offset = totalOffset * (1 - fraction);

  if (ringFill) {
    ringFill.style.strokeDashoffset = offset;
    if (state.r1TimerSeconds <= 4) {
      ringFill.classList.add('urgent');
    } else {
      ringFill.classList.remove('urgent');
    }
  }
}

function handleOptionSelect(selectedIndex, selectedBtn) {
  clearInterval(state.r1TimerInterval);
  const qObj = state.r1Questions[state.r1CurrentIndex];
  const allBtns = document.querySelectorAll('#r1-options-container .option-btn');
  allBtns.forEach(btn => btn.disabled = true);

  const isCorrect = selectedIndex === qObj.answer;
  if (isCorrect) {
    selectedBtn.classList.add('correct');
    sfx.correct();
    state.r1CorrectCount++;
    const speedBonus = state.r1TimerSeconds * 4;
    state.round1Score += (100 + speedBonus);
    document.getElementById('r1-hud-score').textContent = `${state.round1Score} pts`;
  } else {
    selectedBtn.classList.add('wrong');
    allBtns[qObj.answer].classList.add('correct');
    sfx.wrong();
  }

  const factBox = document.getElementById('r1-fact-box');
  factBox.textContent = `💡 Fact: ${qObj.fact}`;
  factBox.style.display = 'block';

  setTimeout(() => {
    state.r1CurrentIndex++;
    if (state.r1CurrentIndex < 5) {
      renderRound1Question();
    } else {
      finishRound1();
    }
  }, 1600);
}

function handleQuestionTimeout() {
  const qObj = state.r1Questions[state.r1CurrentIndex];
  const allBtns = document.querySelectorAll('#r1-options-container .option-btn');
  allBtns.forEach(btn => btn.disabled = true);
  if (allBtns[qObj.answer]) {
    allBtns[qObj.answer].classList.add('correct');
  }
  sfx.wrong();

  const factBox = document.getElementById('r1-fact-box');
  factBox.textContent = `⏱️ Time Expired! 💡 Fact: ${qObj.fact}`;
  factBox.style.display = 'block';

  setTimeout(() => {
    state.r1CurrentIndex++;
    if (state.r1CurrentIndex < 5) {
      renderRound1Question();
    } else {
      finishRound1();
    }
  }, 1600);
}

function finishRound1() {
  document.getElementById('r1-progress').style.width = '100%';
  const passed = state.r1CorrectCount >= 3;

  if (passed) {
    sfx.stagePass();
    document.getElementById('r1-pass-score').textContent = `${state.round1Score} pts`;
    document.getElementById('r1-pass-correct').textContent = `${state.r1CorrectCount}/5`;
    showScreen('screen-r1-pass');
  } else {
    // ELIMINATED: Lock device & NO retry
    state.examInProgress = false;
    sfx.wrong();
    localStorage.setItem('gj_lock_completed', 'true');
    localStorage.setItem('gj_lock_score', state.round1Score.toString());
    localStorage.setItem('gj_lock_status', 'Eliminated in Round 1');

    saveToLeaderboard(state.playerName, state.round1Score, 'Eliminated (R1)');

    document.getElementById('r1-fail-score').textContent = `${state.r1CorrectCount}/5 Correct`;
    document.getElementById('r1-fail-points').textContent = `${state.round1Score} pts`;
    showScreen('screen-r1-fail');
  }
}

// ==========================================
// ROUND 2: AHIMSA PRINCIPLES ASSEMBLY
// ==========================================

function startRound2() {
  clearInterval(state.r2TimerInterval);
  state.r2Puzzles = JSON.parse(JSON.stringify(PUZZLE_DATA));
  state.r2CurrentIndex = 0;
  state.r2SolvedCount = 0;
  state.round2Score = 0;
  state.r2SelectedBlockIndex = null;
  state.r2TimerSeconds = 60; // 60s strict round timer

  showScreen('screen-round2');
  renderRound2HUD();
  renderCurrentPuzzle();

  state.r2TimerInterval = setInterval(() => {
    state.r2TimerSeconds--;
    updateR2TimerDisplay();

    if (state.r2TimerSeconds <= 5 && state.r2TimerSeconds > 0) {
      sfx.tick();
    }

    if (state.r2TimerSeconds <= 0) {
      clearInterval(state.r2TimerInterval);
      finishRound2(true);
    }
  }, 1000);
}

function updateR2TimerDisplay() {
  const timerNum = document.getElementById('r2-timer-num');
  const timerRing = document.getElementById('r2-ring-fill');
  if (timerNum) timerNum.textContent = `${state.r2TimerSeconds}s`;

  if (timerRing) {
    const fraction = state.r2TimerSeconds / 60;
    timerRing.style.strokeDashoffset = 100 * (1 - fraction);
    if (state.r2TimerSeconds <= 10) {
      timerRing.classList.add('urgent');
    } else {
      timerRing.classList.remove('urgent');
    }
  }
}

function renderRound2HUD() {
  document.getElementById('r2-hud-user').textContent = state.playerName;
  document.getElementById('r2-hud-puzzle-num').textContent = `${state.r2CurrentIndex + 1}/3`;
  document.getElementById('r2-hud-score').textContent = `${state.round1Score + state.round2Score} pts`;
  document.getElementById('r2-hud-solved').textContent = `${state.r2SolvedCount}/3 Solved`;
  updateR2TimerDisplay();
}

function renderCurrentPuzzle() {
  const pObj = state.r2Puzzles[state.r2CurrentIndex];
  if (!pObj) return;

  renderRound2HUD();
  document.getElementById('puzzle-title').textContent = pObj.title;
  document.getElementById('puzzle-instruction').textContent = pObj.instruction;

  const container = document.getElementById('puzzle-blocks-container');
  container.innerHTML = '';
  state.r2SelectedBlockIndex = null;

  pObj.scrambled.forEach((text, index) => {
    const block = document.createElement('div');
    block.className = 'puzzle-block';
    block.dataset.index = index;

    block.innerHTML = `
      <div class="puzzle-block-content">
        <span style="color:#8C6D37; font-weight:bold;">☰</span>
        <span class="puzzle-block-text">${text}</span>
      </div>
      <div class="puzzle-block-actions">
        <button class="block-move-btn btn-up" title="Move Up">▲</button>
        <button class="block-move-btn btn-down" title="Move Down">▼</button>
      </div>
    `;

    block.addEventListener('click', (e) => {
      if (e.target.closest('.block-move-btn')) return;
      handleBlockTap(index);
    });

    block.querySelector('.btn-up').addEventListener('click', (e) => {
      e.stopPropagation();
      moveBlock(index, index - 1);
    });

    block.querySelector('.btn-down').addEventListener('click', (e) => {
      e.stopPropagation();
      moveBlock(index, index + 1);
    });

    container.appendChild(block);
  });

  const verifyBtn = document.getElementById('verify-order-btn');
  verifyBtn.onclick = verifyPuzzleOrder;
}

function handleBlockTap(index) {
  sfx.click();
  const blocks = document.querySelectorAll('.puzzle-block');
  
  if (state.r2SelectedBlockIndex === null) {
    state.r2SelectedBlockIndex = index;
    blocks[index].classList.add('tap-selected');
    showToast('Tap another item to swap places!');
  } else if (state.r2SelectedBlockIndex === index) {
    blocks[index].classList.remove('tap-selected');
    state.r2SelectedBlockIndex = null;
  } else {
    const from = state.r2SelectedBlockIndex;
    const to = index;
    blocks[from].classList.remove('tap-selected');
    state.r2SelectedBlockIndex = null;
    swapBlocks(from, to);
  }
}

function moveBlock(from, to) {
  const pObj = state.r2Puzzles[state.r2CurrentIndex];
  if (to < 0 || to >= pObj.scrambled.length) return;
  sfx.click();
  swapBlocks(from, to);
}

function swapBlocks(i, j) {
  const pObj = state.r2Puzzles[state.r2CurrentIndex];
  const temp = pObj.scrambled[i];
  pObj.scrambled[i] = pObj.scrambled[j];
  pObj.scrambled[j] = temp;
  renderCurrentPuzzle();
}

function verifyPuzzleOrder() {
  const pObj = state.r2Puzzles[state.r2CurrentIndex];
  const isMatch = pObj.scrambled.every((item, idx) => item === pObj.correctOrder[idx]);

  if (isMatch) {
    sfx.correct();
    state.r2SolvedCount++;
    state.round2Score += 200;
    renderRound2HUD();

    const blocks = document.querySelectorAll('.puzzle-block');
    blocks.forEach(b => b.classList.add('solved'));
    showToast('✨ Correct order! Outstanding assembly.');

    setTimeout(() => {
      state.r2CurrentIndex++;
      if (state.r2CurrentIndex < state.r2Puzzles.length) {
        renderCurrentPuzzle();
      } else {
        finishRound2(false);
      }
    }, 1100);
  } else {
    sfx.wrong();
    showToast('Not quite right yet. Keep adjusting!');
    const container = document.getElementById('puzzle-blocks-container');
    container.classList.add('shake-error');
    setTimeout(() => container.classList.remove('shake-error'), 500);
  }
}

function finishRound2(timedOut = false) {
  clearInterval(state.r2TimerInterval);
  if (state.r2TimerSeconds > 0 && state.r2SolvedCount >= 2) {
    state.round2Score += (state.r2TimerSeconds * 5);
  }

  const passed = state.r2SolvedCount >= 2;

  if (passed) {
    sfx.stagePass();
    document.getElementById('r2-pass-score').textContent = `${state.round2Score} pts`;
    document.getElementById('r2-pass-count').textContent = `${state.r2SolvedCount}/3 Puzzles`;
    document.getElementById('r2-pass-time').textContent = `${60 - state.r2TimerSeconds}s`;
    showScreen('screen-r2-pass');
  } else {
    // ELIMINATED
    state.examInProgress = false;
    sfx.wrong();
    const finalScore = state.round1Score + state.round2Score;
    localStorage.setItem('gj_lock_completed', 'true');
    localStorage.setItem('gj_lock_score', finalScore.toString());
    localStorage.setItem('gj_lock_status', 'Eliminated in Round 2');

    saveToLeaderboard(state.playerName, finalScore, 'Eliminated (R2)');

    document.getElementById('r2-fail-solved').textContent = `${state.r2SolvedCount}/3 Solved`;
    document.getElementById('r2-fail-points').textContent = `${finalScore} pts`;
    showScreen('screen-r2-fail');
  }
}

// ==========================================
// ROUND 3: DANDI MARCH ROUTE CHALLENGE
// ==========================================

function startRound3() {
  clearInterval(state.r3TimerInterval);
  state.r3CurrentStopIndex = 0;
  state.r3Mistakes = 0;
  state.r3Streak = 0;
  state.round3Score = 0;
  state.r3SecondsElapsed = 0;

  showScreen('screen-round3');
  renderRound3HUD();
  renderDandiMap();
  renderDandiPrompt();

  state.r3TimerInterval = setInterval(() => {
    state.r3SecondsElapsed++;
    const timerEl = document.getElementById('r3-timer-num');
    if (timerEl) timerEl.textContent = `${state.r3SecondsElapsed}s`;
  }, 1000);
}

function renderRound3HUD() {
  document.getElementById('r3-hud-user').textContent = state.playerName;
  document.getElementById('r3-hud-progress').textContent = `${state.r3CurrentStopIndex}/8 Stops`;
  document.getElementById('r3-hud-score').textContent = `${state.round1Score + state.round2Score + state.round3Score} pts`;
  document.getElementById('r3-progress-bar').style.width = `${(state.r3CurrentStopIndex / 8) * 100}%`;
}

function renderDandiMap() {
  const svg = document.getElementById('dandi-route-svg');
  if (!svg) return;

  let pathD = "M ";
  DANDI_STOPS.forEach((stop, i) => {
    const pt = `${stop.coords.x * 3.5 + 20},${stop.coords.y * 0.9 + 15}`;
    pathD += (i === 0 ? pt : ` L ${pt}`);
  });

  const bgPath = document.getElementById('svg-bg-path');
  if (bgPath) bgPath.setAttribute('d', pathD);

  const activePath = document.getElementById('svg-active-path');
  if (activePath) activePath.setAttribute('d', pathD);

  const pinsGroup = document.getElementById('svg-pins-group');
  pinsGroup.innerHTML = '';

  DANDI_STOPS.forEach((stop, idx) => {
    const cx = stop.coords.x * 3.5 + 20;
    const cy = stop.coords.y * 0.9 + 15;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', `stop-pin ${idx === state.r3CurrentStopIndex ? 'active' : ''} ${idx < state.r3CurrentStopIndex ? 'visited' : ''}`);

    g.innerHTML = `
      <circle class="outer" cx="${cx}" cy="${cy}" r="11" />
      <circle class="inner" cx="${cx}" cy="${cy}" r="4" fill="${idx < state.r3CurrentStopIndex ? '#386641' : '#E26D14'}" />
      <text x="${cx + 14}" y="${cy + 4}">${stop.name}</text>
    `;

    g.addEventListener('click', () => handleStopClick(stop.id));
    pinsGroup.appendChild(g);
  });
}

function renderDandiPrompt() {
  const currentTarget = DANDI_STOPS[state.r3CurrentStopIndex];
  if (!currentTarget) return;

  document.getElementById('dandi-target-name').textContent = `Stop #${currentTarget.num}: ${currentTarget.name}`;
  document.getElementById('dandi-target-date').textContent = currentTarget.date;

  const stopsGrid = document.getElementById('dandi-stops-grid');
  stopsGrid.innerHTML = '';

  const options = [...DANDI_STOPS].sort(() => 0.5 - Math.random());
  options.forEach(stop => {
    const btn = document.createElement('button');
    btn.className = 'dandi-stop-btn';
    btn.id = `btn-stop-${stop.id}`;
    if (stop.num < currentTarget.num) {
      btn.classList.add('completed');
    }

    btn.innerHTML = `
      <span class="stage-num">${stop.num}</span>
      <div>
        <div style="font-weight:700;">${stop.name}</div>
        <div style="font-size:10px; color:#6B5E55;">${stop.city}</div>
      </div>
    `;

    btn.addEventListener('click', () => handleStopClick(stop.id, btn));
    stopsGrid.appendChild(btn);
  });
}

function handleStopClick(stopId, btnElement = null) {
  const currentTarget = DANDI_STOPS[state.r3CurrentStopIndex];
  if (!currentTarget) return;

  if (stopId === currentTarget.id) {
    sfx.correct();
    state.r3Streak++;
    const points = 150 + (state.r3Streak * 20);
    state.round3Score += points;
    state.r3CurrentStopIndex++;

    showToast(`📍 Reached ${currentTarget.name}! ${currentTarget.info}`);
    renderRound3HUD();
    renderDandiMap();

    if (state.r3CurrentStopIndex < DANDI_STOPS.length) {
      setTimeout(renderDandiPrompt, 400);
    } else {
      finishRound3();
    }
  } else {
    sfx.wrong();
    state.r3Mistakes++;
    state.r3Streak = 0;
    showToast('Incorrect stop! Check chronological sequence.');

    const targetBtn = btnElement || document.getElementById(`btn-stop-${stopId}`);
    if (targetBtn) {
      targetBtn.classList.add('shake-error');
      setTimeout(() => targetBtn.classList.remove('shake-error'), 400);
    }
  }
}

function finishRound3() {
  clearInterval(state.r3TimerInterval);
  state.examInProgress = false;
  sfx.victory();

  const timeBonus = Math.max(0, (90 - state.r3SecondsElapsed) * 8);
  const accuracyBonus = Math.max(0, (8 - state.r3Mistakes) * 50);
  state.round3Score += (timeBonus + accuracyBonus);

  state.totalScore = state.round1Score + state.round2Score + state.round3Score;

  // LOCK FINAL SCORE
  localStorage.setItem('gj_lock_completed', 'true');
  localStorage.setItem('gj_lock_score', state.totalScore.toString());
  localStorage.setItem('gj_lock_name', state.playerName);
  localStorage.setItem('gj_lock_status', 'Grand Finale Completed');

  saveToLeaderboard(state.playerName, state.totalScore, 'Completed');
  triggerConfetti();

  setTimeout(() => {
    showFinalResults();
  }, 1000);
}

// ==========================================
// RESULTS & LEADERBOARD DATA
// ==========================================

function saveToLeaderboard(name, score, status = 'Completed') {
  let list = JSON.parse(localStorage.getItem('gj_leaderboard_v1') || '[]');
  if (list.length === 0) {
    list = [
      { name: "Aarav Sharma", r1: 480, r2: 560, r3: 380, score: 1420, status: "Completed", date: "Oct 2" },
      { name: "Diya Patel", r1: 420, r2: 500, r3: 340, score: 1260, status: "Completed", date: "Oct 2" },
      { name: "Kabir Mehta", r1: 380, r2: 420, r3: 280, score: 1080, status: "Completed", date: "Oct 2" },
      { name: "Ananya Iyer", r1: 340, r2: 360, r3: 240, score: 940, status: "Completed", date: "Oct 2" }
    ];
  }

  const todayStr = new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  list.push({
    name: name,
    r1: state.round1Score,
    r2: state.round2Score,
    r3: state.round3Score,
    score: score,
    status: status,
    date: todayStr,
    isCurrentUser: true
  });

  list.sort((a, b) => b.score - a.score);
  localStorage.setItem('gj_leaderboard_v1', JSON.stringify(list));
}

function showFinalResults() {
  showScreen('screen-final');

  document.getElementById('final-player-name').textContent = state.playerName;
  document.getElementById('final-total-score').textContent = `${state.totalScore} pts`;

  document.getElementById('score-r1-val').textContent = `${state.round1Score} pts`;
  document.getElementById('score-r2-val').textContent = `${state.round2Score} pts`;
  document.getElementById('score-r3-val').textContent = `${state.round3Score} pts`;

  renderPodiumAndLeaderboard();
}

function renderPodiumAndLeaderboard() {
  const list = JSON.parse(localStorage.getItem('gj_leaderboard_v1') || '[]');

  const first = list[0] || { name: "Player 1", score: 1400 };
  const second = list[1] || { name: "Player 2", score: 1200 };
  const third = list[2] || { name: "Player 3", score: 1000 };

  document.getElementById('podium-1st-name').textContent = first.name;
  document.getElementById('podium-1st-score').textContent = `${first.score} pts`;

  document.getElementById('podium-2nd-name').textContent = second.name;
  document.getElementById('podium-2nd-score').textContent = `${second.score} pts`;

  document.getElementById('podium-3rd-name').textContent = third.name;
  document.getElementById('podium-3rd-score').textContent = `${third.score} pts`;

  const lbContainer = document.getElementById('leaderboard-list-items');
  lbContainer.innerHTML = '';

  list.slice(0, 6).forEach((item, index) => {
    const row = document.createElement('div');
    row.className = `leaderboard-item ${item.isCurrentUser ? 'current-user' : ''}`;
    
    let medal = `${index + 1}.`;
    if (index === 0) medal = '🥇';
    if (index === 1) medal = '🥈';
    if (index === 2) medal = '🥉';

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-weight:700; width:22px;">${medal}</span>
        <span style="font-weight:600;">${item.name} ${item.isCurrentUser ? '(You)' : ''}</span>
      </div>
      <span style="font-weight:700; color:var(--color-navy);">${item.score} pts</span>
    `;
    lbContainer.appendChild(row);
  });
}

// ==========================================
// WHATSAPP SHARING
// ==========================================

function getShareText() {
  const score = state.totalScore || parseInt(localStorage.getItem('gj_lock_score') || '0', 10);
  const currentUrl = window.location.href;
  return `🕊️ *Gandhi Jayanti 2026 Challenge* 🇮🇳\n\nI scored *${score} points* on the Gandhi Jayanti Challenge! Can you beat me? Try here:\n👉 ${currentUrl}`;
}

function shareOnWhatsApp() {
  sfx.click();
  const text = encodeURIComponent(getShareText());
  const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
  
  if (navigator.share) {
    navigator.share({
      title: 'Gandhi Jayanti Challenge',
      text: getShareText(),
      url: window.location.href
    }).catch(() => {
      window.open(whatsappUrl, '_blank');
    });
  } else {
    window.open(whatsappUrl, '_blank');
  }
}

function copyShareLink() {
  sfx.click();
  const shareText = getShareText();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(shareText).then(() => {
      showToast('📋 WhatsApp score message copied to clipboard!');
    }).catch(() => {
      showToast('Link ready to share!');
    });
  } else {
    showToast('Link ready to share!');
  }
}

// ==========================================
// CERTIFICATE MODAL
// ==========================================

function showCertificateModal() {
  sfx.click();
  const name = state.playerName || localStorage.getItem('gj_lock_name') || 'Player';
  const score = state.totalScore || localStorage.getItem('gj_lock_score') || '0';

  document.getElementById('cert-player-name').textContent = name;
  document.getElementById('cert-score-text').textContent = `${score} Points`;
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  document.getElementById('cert-date-text').textContent = today;
  document.getElementById('certificate-modal').classList.add('active');
}

function hideCertificateModal() {
  sfx.click();
  document.getElementById('certificate-modal').classList.remove('active');
}

// ==========================================
// CONFETTI BURST
// ==========================================

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles = [];
  const colors = ['#E26D14', '#386641', '#FFFFFF', '#D4AF37', '#14213D'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() * 80 - 40),
      y: canvas.height / 2 + (Math.random() * 80 - 40),
      r: Math.random() * 6 + 3,
      dx: (Math.random() - 0.5) * 14,
      dy: (Math.random() - 0.7) * 16,
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      color: colors[Math.floor(Math.random() * colors.length)],
      gravity: 0.35,
      life: 1
    });
  }

  let animationFrame;
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach(p => {
      if (p.life > 0) {
        alive = true;
        p.x += p.dx;
        p.y += p.dy;
        p.dy += p.gravity;
        p.dx *= 0.98;
        p.life -= 0.01;
        p.tilt += p.tiltSpeed;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, p.r, p.r * Math.cos(p.tilt), 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });

    if (alive) {
      animationFrame = requestAnimationFrame(render);
    } else {
      cancelAnimationFrame(animationFrame);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  }

  render();
}

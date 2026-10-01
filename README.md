# 🕊️ Gandhi Jayanti Challenge 2026 - Secure Edition with Admin Panel

A mobile-friendly, secure 3-round web competition with **strict anti-cheating**, **screen overlay & focus monitoring**, **single-session device locking**, **question randomization**, and a **password-protected Admin Dashboard**.

---

## 🛡️ Anti-Cheating & Screen Overlay Protection

1. **Window Focus & Screen Overlay Guard**:
   - Monitors `window.onblur` and `document.visibilitychange`.
   - **Detects**: Tab switching, minimizing the browser, or summoning AI search overlays (e.g. **Gemini Live**, **Circle to Search**, or mobile floating overlays).
   - **1st Violation**: Displays a full-screen alert modal:
     > *"⚠️ Screen Focus Lost / Overlay Detected! Navigating away, switching tabs, or summoning AI search overlays is strictly monitored. Next attempt will result in instant zero score."*
   - **2nd Violation**: Instantly terminates the exam, sets the active round and total score to **0**, permanently locks the player, and redirects them to the **Attempt Disqualified** screen.

2. **Single Attempt Device Lock**:
   - Flags the browser device as `Attempted` the second a player clicks **"Start Challenge"**.
   - If a user tries to reload, re-enter the link, or revisit the page, they are blocked and shown:
     > *"You have already completed your attempt today!"* alongside their recorded final score and a WhatsApp share button.

3. **Text Copy & Search Prevention**:
   - `user-select: none !important;` applied across question content.
   - Right-click context menus are suppressed.
   - Shortcut combinations (`Ctrl+C`, `Cmd+C`, `Ctrl+U`, `Ctrl+S`, `F12`, `Ctrl+Shift+I`) are intercepted and blocked.

4. **18+ Question Randomization & Option Shuffling**:
   - Master pool of 18 historical questions on Mahatma Gandhi.
   - 5 random questions picked per player run.
   - Options (A, B, C, D) are scrambled per question.

---

## 🔐 Secret Admin Dashboard (Organizer Only)

- **Access**: Click the **"⚙️ Organizer"** link in the footer (bottom right).
- **Default Security PIN**: **`1861`** *(also accepts `bapu1869`)*.
- **Admin Capabilities**:
  * **Live Leaderboard View**: View all participant attempts, individual round breakdown (R1, R2, R3), status (*Completed*, *Eliminated*, *Disqualified*), and total scores.
  * **Unlock Device for New Test**: Clears all local lock flags with 1 click so organizers can allow a student to re-test on the same device or reset after a demo.
  * **Delete Specific Scores**: Remove test entries from the database.
  * **Clear All Scores**: Purge leaderboard for a fresh competition.
  * **Export to CSV**: Download `gandhi_jayanti_leaderboard.csv` with all player ranks, scores, and dates.

---

## 🚀 How to Run Locally

The app is served via Python:

```powershell
cd C:\Users\cleme\.gemini\antigravity\scratch\gandhi-jayanti-challenge
python -m http.server 8080
```

Open [**`http://localhost:8080`**](http://localhost:8080) in your browser.

---

## 📁 Files for GitHub Upload

Drag & drop these files into your GitHub repository:
1. [`index.html`](file:///C:/Users/cleme/.gemini/antigravity/scratch/gandhi-jayanti-challenge/index.html)
2. [`style.css`](file:///C:/Users/cleme/.gemini/antigravity/scratch/gandhi-jayanti-challenge/style.css)
3. [`app.js`](file:///C:/Users/cleme/.gemini/antigravity/scratch/gandhi-jayanti-challenge/app.js)
4. [`README.md`](file:///C:/Users/cleme/.gemini/antigravity/scratch/gandhi-jayanti-challenge/README.md)

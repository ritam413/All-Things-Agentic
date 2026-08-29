"""
Main FastAPI Application Entrypoint for RoomieOps AI.
Provides REST API, CORS middleware, interactive Swagger (/docs),
and a standalone embedded visual dashboard at root (/).
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse

from backend.app.api.routes import router as api_router

app = FastAPI(
    title="RoomieOps AI — Autonomous Roommate Rent & Expense Ops Agent",
    description="Autonomous expense-management, multimodal receipt parsing, UPI deep links, and Min-Cash-Flow debt settlement agent on Google Cloud.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Open for development and cross-origin Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router)


# Embedded Standalone Web UI for Cloud Run Root Route
@app.get("/", response_class=HTMLResponse)
def root_dashboard():
    return """
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RoomieOps AI — Cloud Run Operational Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    body { background-color: #080C14; color: #F3F4F6; font-family: 'Inter', sans-serif; }
    .font-heading { font-family: 'Outfit', sans-serif; }
    .glass { background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 16px; }
  </style>
</head>
<body class="p-6 md:p-12 selection:bg-cyan-500 selection:text-black">
  <div class="max-w-6xl mx-auto space-y-8">
    <!-- Header -->
    <div class="glass p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-cyan-500/20">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-3 py-1 text-xs font-mono font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">Google Cloud Run Live</span>
          <span class="px-3 py-1 text-xs font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30 rounded-full">The Taskmaster Track</span>
        </div>
        <h1 class="text-4xl font-heading font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 mt-2">
          RoomieOps AI Backend
        </h1>
        <p class="text-gray-400 mt-1">Autonomous Roommate Rent & Expense Ops Agent Engine</p>
      </div>
      <div class="flex items-center gap-3">
        <a href="/docs" class="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold rounded-xl text-sm transition-all shadow-lg shadow-cyan-500/20">
          Swagger API Docs ↗
        </a>
      </div>
    </div>

    <!-- Quick Action Deck -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="glass p-6 space-y-3">
        <h3 class="text-lg font-heading font-bold text-white">📸 Multimodal Ingestion</h3>
        <p class="text-sm text-gray-400">Trigger sample bill ingestion with Gemini vision and split calculation.</p>
        <button onclick="triggerPreset('electricity')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs rounded-lg border border-cyan-500/20">
          + Ingest Electricity Bill (₹2,450)
        </button>
        <button onclick="triggerPreset('wifi')" class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-mono text-xs rounded-lg border border-cyan-500/20">
          + Ingest Wifi Bill (₹1,199)
        </button>
      </div>

      <div class="glass p-6 space-y-3">
        <h3 class="text-lg font-heading font-bold text-white">⏳ Autonomous Time-Travel</h3>
        <p class="text-sm text-gray-400">Fast-forward clock to simulate Cloud Scheduler due-date scans.</p>
        <button onclick="simulateDays(3)" class="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 font-mono text-xs rounded-lg border border-amber-500/30">
          ⚡ Fast-Forward +3 Days (Nudge)
        </button>
        <button onclick="simulateDays(7)" class="w-full py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-mono text-xs rounded-lg border border-rose-500/30">
          🚨 Fast-Forward +7 Days (Overdue)
        </button>
      </div>

      <div class="glass p-6 space-y-3">
        <h3 class="text-lg font-heading font-bold text-white">🔄 Debt Simplification</h3>
        <p class="text-sm text-gray-400">Run Min-Cash-Flow graph solver over active household debts.</p>
        <button onclick="fetchSimplifiedDebts()" class="w-full py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 font-mono text-xs rounded-lg border border-purple-500/30">
          📊 Calculate Min Settlements
        </button>
      </div>
    </div>

    <!-- Live Output Log -->
    <div class="glass p-6 space-y-3">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-heading font-bold text-white">⚡ Live Agent Activity Feed</h3>
        <button onclick="loadActivity()" class="text-xs font-mono text-cyan-400 hover:underline">Refresh</button>
      </div>
      <div id="activity-feed" class="space-y-2 max-h-72 overflow-y-auto font-mono text-xs text-gray-300">
        <div class="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-gray-400">Loading agent activity...</div>
      </div>
    </div>
  </div>

  <script>
    async function loadActivity() {
      try {
        const res = await fetch('/api/agent/activity');
        const data = await res.json();
        const feed = document.getElementById('activity-feed');
        if (!data.length) {
          feed.innerHTML = '<div class="p-3 bg-slate-950 rounded border border-slate-800 text-gray-500">No logs yet.</div>';
          return;
        }
        feed.innerHTML = data.map(log => `
          <div class="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex items-start justify-between">
            <div>
              <div class="font-semibold text-white">${log.title}</div>
              <div class="text-gray-400 mt-1">${log.description}</div>
            </div>
            <span class="text-[10px] text-gray-500 ml-4">${new Date(log.timestamp).toLocaleTimeString()}</span>
          </div>
        `).join('');
      } catch (e) { console.error(e); }
    }

    async function triggerPreset(type) {
      await fetch('/api/expenses/preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preset_type: type, household_id: 'hh_palm_grove_402' })
      });
      loadActivity();
    }

    async function simulateDays(days) {
      await fetch('/api/agent/simulate-days', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ days_forward: days, household_id: 'hh_palm_grove_402' })
      });
      loadActivity();
    }

    async function fetchSimplifiedDebts() {
      const res = await fetch('/api/debts/simplify?household_id=hh_palm_grove_402');
      const data = await res.json();
      alert(`Debt Simplification Result:\nRaw Debts: ${data.raw_debts_count}\nOptimized Transfers: ${data.simplified_transfers_count}\nTotal Cleared: ₹${data.total_volume_cleared}`);
      loadActivity();
    }

    loadActivity();
  </script>
</body>
</html>
"""

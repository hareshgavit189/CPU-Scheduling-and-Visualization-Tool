/* ══════════════════════════════════════════════════════
   Visualization & UI — Premium Edition
   ══════════════════════════════════════════════════════ */

const COLORS = [
  '#818cf8','#34d399','#fb923c','#f43f5e','#a78bfa',
  '#fbbf24','#22d3ee','#f472b6','#38bdf8','#e879f9'
];
const COLOR_BG = [
  'rgba(129,140,248,.15)','rgba(52,211,153,.15)','rgba(251,146,60,.15)',
  'rgba(244,63,94,.15)','rgba(167,139,250,.15)','rgba(251,191,36,.15)',
  'rgba(34,211,238,.15)','rgba(244,114,182,.15)','rgba(56,189,248,.15)','rgba(232,121,249,.15)'
];

// ─── Enhanced Gantt Chart ─────────────────────────────
function renderGantt(gantt, algoKey) {
  if (!gantt.length) return '';
  const totalT = gantt[gantt.length - 1].end - gantt[0].start;
  const scale = Math.max(30, Math.min(72, 600 / Math.max(totalT, 1)));
  let html = '<div class="gantt-wrap"><div class="gantt-container"><div class="gantt-row">';
  for (let i = 0; i < gantt.length; i++) {
    const g = gantt[i];
    const w = Math.max(30, (g.end - g.start) * scale);
    const isIdle = g.pid === 'idle';
    const ci = isIdle ? 0 : (g.pid - 1) % COLORS.length;
    const col = isIdle ? 'rgba(255,255,255,0.02)' : COLOR_BG[ci];
    const border = isIdle ? 'rgba(255,255,255,0.05)' : COLORS[ci] + '33';
    const tc = isIdle ? 'var(--text3)' : COLORS[ci];
    let tipData = isIdle ? `IDLE|${g.start}-${g.end}` : `P${g.pid}|${g.start}-${g.end}`;
    if (g.queueLevel !== undefined) tipData += `|Queue: ${g.queueLevel}`;
    if (g.vruntime !== undefined) tipData += `|vruntime: ${g.vruntime}`;
    if (g.tickets !== undefined) tipData += `|Tickets: ${g.tickets}/${g.totalTickets}`;
    const preempt = g.preempt ? '<span class="preempt-marker"></span>' : '';
    html += `<div class="gblock" style="width:${w}px;background:${col};border-right:2px solid var(--bg);border-top:2px solid ${border};color:${tc}" data-tip="${tipData}" onmouseenter="showTip(event,this)" onmouseleave="hideTip()">
      ${isIdle ? '—' : 'P' + g.pid}${preempt}
      <span class="gtick">${g.start}</span>
    </div>`;
  }
  html += `</div><span class="glast-tick">${gantt[gantt.length - 1].end}</span></div></div>`;
  return html;
}

// ─── Tooltip ──────────────────────────────────────────
function showTip(e, el) {
  const tip = document.getElementById('tooltip');
  const d = el.dataset.tip.split('|');
  let content = `<span style="color:var(--accent-light);font-weight:600">${d[0]}</span><br><span style="color:var(--text3)">Time:</span> ${d[1]}`;
  for (let i = 2; i < d.length; i++) content += `<br><span style="color:var(--text3)">${d[i].split(':')[0]}:</span> ${d[i].split(':').slice(1).join(':')}`;
  tip.innerHTML = content;
  tip.style.display = 'block';
  tip.style.left = (e.clientX + 14) + 'px';
  tip.style.top = (e.clientY - 12) + 'px';
}
function hideTip() { document.getElementById('tooltip').style.display = 'none'; }

// ─── Process Table ────────────────────────────────────
function renderTable(procs) {
  const sorted = [...procs].sort((a, b) => a.pid - b.pid);
  let html = `<div style="overflow-x:auto;border-radius:var(--radius);border:1px solid var(--border);background:rgba(17,21,32,0.5)"><table class="proc-table">
    <thead><tr><th>PID</th><th>AT</th><th>BT</th><th>PRI</th><th>RT</th><th>WT</th><th>TAT</th><th>CT</th></tr></thead><tbody>`;
  for (let x of sorted) {
    const c = COLORS[(x.pid - 1) % COLORS.length];
    html += `<tr>
      <td><span class="pdot" style="background:${c}"></span><span style="font-weight:600">P${x.pid}</span></td>
      <td>${x.at}</td><td>${x.bt}</td><td>${x.pr}</td>
      <td><span style="color:var(--purple);font-family:'JetBrains Mono',monospace;font-weight:600">${x.rt !== undefined && x.rt >= 0 ? x.rt : '—'}</span></td>
      <td><span style="color:var(--green);font-family:'JetBrains Mono',monospace;font-weight:600">${x.wt}</span></td>
      <td><span style="color:var(--accent-light);font-family:'JetBrains Mono',monospace;font-weight:600">${x.tat}</span></td>
      <td><span style="color:var(--orange);font-family:'JetBrains Mono',monospace;font-weight:600">${x.ct || '—'}</span></td>
    </tr>`;
  }
  html += '</tbody></table></div>';
  return html;
}

// ─── Metrics Dashboard ───────────────────────────────
function renderMetrics(a, pLen, q) {
  let html = '<div class="metrics-row">';
  html += `<div class="metric"><div class="metric-label">Avg Wait</div><div class="metric-val green">${a.awt.toFixed(2)}</div></div>`;
  html += `<div class="metric"><div class="metric-label">Avg TAT</div><div class="metric-val blue">${a.atat.toFixed(2)}</div></div>`;
  html += `<div class="metric"><div class="metric-label">Avg Response</div><div class="metric-val purple">${a.art.toFixed(2)}</div></div>`;
  html += `<div class="metric"><div class="metric-label">CPU Util</div><div class="metric-val orange">${a.util.toFixed(1)}%</div></div>`;
  html += `<div class="metric"><div class="metric-label">Ctx Switches</div><div class="metric-val" style="color:var(--cyan)">${a.r.cs}</div></div>`;
  html += `<div class="metric"><div class="metric-label">Processes</div><div class="metric-val" style="color:var(--pink)">${pLen}</div></div>`;
  if (a.key === 'rr') html += `<div class="metric"><div class="metric-label">Quantum</div><div class="metric-val">${q}</div></div>`;
  html += '</div>';
  return html;
}

// ─── MLFQ Visualization ──────────────────────────────
function renderMLFQViz(result) {
  const qLabels = ['HIGH PRIORITY', 'MEDIUM PRIORITY', 'LOW PRIORITY'];
  const qColors = ['var(--accent-light)', 'var(--yellow)', 'var(--red)'];
  const qIcons = ['⚡', '◆', '▼'];
  let html = '<div class="sec-label">Queue Structure</div><div class="mlfq-viz">';
  for (let q = 0; q < result.numQueues; q++) {
    html += `<div class="mlfq-queue" style="border-left:3px solid ${qColors[q]}">
      <div class="mlfq-queue-label"><span style="color:${qColors[q]}">${qIcons[q]}</span> ${qLabels[q]}<br><span style="opacity:.6">quantum: ${result.quanta[q]}ms</span></div>`;
    const procsInQ = [...new Set(result.gantt.filter(g => g.queueLevel === q).map(g => g.pid))];
    for (let pid of procsInQ) {
      const c = COLORS[(pid - 1) % COLORS.length]; const cb = COLOR_BG[(pid - 1) % COLOR_BG.length];
      html += `<span class="mlfq-proc-chip" style="background:${cb};color:${c};border:1px solid ${c}33">P${pid}</span>`;
    }
    if (!procsInQ.length) html += '<span style="font-size:8px;color:var(--text3);font-family:JetBrains Mono,monospace;font-style:italic">empty</span>';
    html += '</div>';
  }
  html += '</div>';
  if (result.queueHistory && result.queueHistory.length) {
    html += '<div class="sec-label">Queue Movements</div><div class="log-box">';
    for (let h of result.queueHistory.slice(0, 25)) {
      const arrow = h.reason === 'demotion' ? '↓' : h.reason === 'aging' ? '↑' : '→';
      const color = h.reason === 'demotion' ? 'var(--red)' : h.reason === 'aging' ? 'var(--green)' : 'var(--accent-light)';
      html += `<div>t=${h.time} <span style="color:${COLORS[(h.pid-1)%COLORS.length]}">P${h.pid}</span> <span style="color:${color}">${arrow} Q${h.to}</span> <span style="color:var(--text3);opacity:.6">${h.reason}</span></div>`;
    }
    html += '</div>';
  }
  return html;
}

// ─── CFS vruntime Graph ──────────────────────────────
function renderCFSViz(result) {
  const log = result.vruntimeLog;
  if (!log || !log.length) return '';
  const pids = result.procs.map(p => 'P' + p.pid);
  const canvasId = 'cfs-' + Math.random().toString(36).substr(2, 6);
  let html = `<div class="sec-label">Virtual Runtime Progression</div>
    <div class="cfs-graph"><canvas id="${canvasId}" width="620" height="200" style="width:100%;max-width:620px"></canvas></div>`;
  setTimeout(() => drawCFSGraph(canvasId, log, pids, result.procs), 60);
  return html;
}

function drawCFSGraph(canvasId, log, pids, procs) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const pad = { t: 24, r: 30, b: 28, l: 48 };
  const gW = W - pad.l - pad.r, gH = H - pad.t - pad.b;
  let maxTime = Math.max(...log.map(l => l.time));
  let maxVR = 0;
  for (let l of log) for (let k of pids) if (l[k] !== undefined) maxVR = Math.max(maxVR, l[k]);
  if (maxVR === 0) maxVR = 1;
  // BG
  const cs = getComputedStyle(document.documentElement);
  ctx.fillStyle = cs.getPropertyValue('--bg3').trim() || '#181e33';
  ctx.fillRect(0, 0, W, H);
  // Grid
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 5; i++) {
    let y = pad.t + (gH / 5) * i;
    ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W - pad.r, y); ctx.stroke();
  }
  // Axis labels
  ctx.fillStyle = cs.getPropertyValue('--text3').trim() || '#4d567a'; ctx.font = '8px JetBrains Mono'; ctx.textAlign = 'right';
  for (let i = 0; i <= 5; i++) {
    ctx.fillText((maxVR * (5 - i) / 5).toFixed(1), pad.l - 6, pad.t + (gH / 5) * i + 3);
  }
  ctx.textAlign = 'center';
  ctx.fillText('0', pad.l, H - 6);
  ctx.fillText(maxTime.toString(), W - pad.r, H - 6);
  ctx.fillStyle = cs.getPropertyValue('--text3').trim() || '#4d567a'; ctx.fillText('time →', W / 2, H - 4);
  // Lines
  for (let pi = 0; pi < pids.length; pi++) {
    const key = pids[pi]; const color = COLORS[pi % COLORS.length];
    // Glow
    ctx.strokeStyle = color + '40'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); let started = false;
    for (let l of log) {
      if (l[key] === undefined || l[key] === 0) continue;
      let x = pad.l + (l.time / maxTime) * gW, y = pad.t + gH - (l[key] / maxVR) * gH;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // Line
    ctx.strokeStyle = color; ctx.lineWidth = 2;
    ctx.beginPath(); started = false;
    for (let l of log) {
      if (l[key] === undefined || l[key] === 0) continue;
      let x = pad.l + (l.time / maxTime) * gW, y = pad.t + gH - (l[key] / maxVR) * gH;
      if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
    }
    ctx.stroke();
    // End label
    let last = [...log].reverse().find(l => l[key] !== undefined && l[key] > 0);
    if (last && started) {
      let x = pad.l + (last.time / maxTime) * gW + 5;
      let y = pad.t + gH - (last[key] / maxVR) * gH;
      ctx.fillStyle = color; ctx.font = 'bold 9px JetBrains Mono'; ctx.textAlign = 'left';
      ctx.fillText(key, x, y + 3);
      // Dot
      ctx.beginPath(); ctx.arc(x - 5, y, 3, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
    }
  }
}

// ─── Lottery Visualization ────────────────────────────
function renderLotteryViz(result) {
  if (!result.drawHistory || !result.drawHistory.length) return '';
  const lastDraw = result.drawHistory[result.drawHistory.length - 1];
  const canvasId = 'lot-' + Math.random().toString(36).substr(2, 6);
  let html = '<div class="sec-label">Ticket Distribution</div><div class="lottery-viz">';
  html += `<div class="lottery-wheel"><canvas id="${canvasId}" width="150" height="150"></canvas></div>`;
  html += '<div class="lottery-dist">';
  const allProcs = {};
  for (let d of result.drawHistory) for (let p of d.distribution) allProcs[p.pid] = p;
  for (let pid in allProcs) {
    const p = allProcs[pid]; const c = COLORS[(pid - 1) % COLORS.length];
    const barW = Math.max(10, parseFloat(p.pct) * 2);
    html += `<div class="lottery-bar-row">
      <span class="lottery-bar-label" style="color:${c}">P${pid}</span>
      <div class="lottery-bar" style="width:${barW}px;background:linear-gradient(90deg,${c},${c}66)"></div>
      <span class="lottery-bar-pct">${p.tickets} tickets · ${p.pct}%</span>
    </div>`;
  }
  html += '</div></div>';
  setTimeout(() => drawLotteryWheel(canvasId, lastDraw), 60);
  html += '<div class="sec-label" style="margin-top:10px">Draw History</div><div class="log-box">';
  for (let d of result.drawHistory.slice(-12)) {
    const c = COLORS[(d.winner - 1) % COLORS.length];
    html += `<div>t=${d.time}: ticket <span style="color:var(--yellow)">#${d.ticket}</span>/${d.total} → <span style="color:${c};font-weight:600">P${d.winner}</span></div>`;
  }
  html += '</div>';
  return html;
}

function drawLotteryWheel(canvasId, draw) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const cx = 75, cy = 75, r = 65;
  let startAngle = -Math.PI / 2;
  const total = draw.distribution.reduce((s, p) => s + p.tickets, 0);
  // Outer glow
  ctx.beginPath(); ctx.arc(cx, cy, r + 4, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx, cy, r - 5, cx, cy, r + 10);
  grad.addColorStop(0, 'transparent'); grad.addColorStop(1, 'rgba(99,102,241,0.08)');
  ctx.fillStyle = grad; ctx.fill();
  for (let p of draw.distribution) {
    const sliceAngle = (p.tickets / total) * 2 * Math.PI;
    const c = COLORS[(p.pid - 1) % COLORS.length];
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    const sliceGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    sliceGrad.addColorStop(0, c + '44'); sliceGrad.addColorStop(1, c + 'aa');
    ctx.fillStyle = sliceGrad; ctx.fill();
    ctx.strokeStyle = '#06080d'; ctx.lineWidth = 2; ctx.stroke();
    const midAngle = startAngle + sliceAngle / 2;
    const lx = cx + Math.cos(midAngle) * (r * 0.6);
    const ly = cy + Math.sin(midAngle) * (r * 0.6);
    if (sliceAngle > 0.35) {
      ctx.fillStyle = '#fff'; ctx.font = 'bold 9px JetBrains Mono';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P' + p.pid, lx, ly);
    }
    startAngle += sliceAngle;
  }
  // Center
  ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  const cs2 = getComputedStyle(document.documentElement);
  ctx.fillStyle = cs2.getPropertyValue('--bg').trim() || '#0c0f1a'; ctx.fill();
  ctx.strokeStyle = '#818cf844'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = '#818cf8'; ctx.font = 'bold 7px JetBrains Mono';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('DRAW', cx, cy);
}

// ─── Comparison Mode ─────────────────────────────────
function renderComparison(algo1, algo2) {
  let html = '<div class="compare-side">';
  for (let a of [algo1, algo2]) {
    html += `<div><div class="sec-label">${a.name}</div>`;
    html += renderMetrics(a, a.r.procs.length, 0);
    html += '<div class="sec-label" style="margin-top:8px">Gantt</div>';
    html += renderGantt(a.r.gantt, a.key);
    html += '</div>';
  }
  html += '</div>';
  return html;
}

// ─── Export ───────────────────────────────────────────
function exportJSON(algos) {
  const data = algos.map(a => ({
    algorithm: a.name, avgWait: a.awt, avgTAT: a.atat, avgResponse: a.art,
    cpuUtil: a.util, contextSwitches: a.r.cs,
    processes: a.r.procs.map(p => ({ pid:p.pid, at:p.at, bt:p.bt, pr:p.pr, wt:p.wt, tat:p.tat, rt:p.rt })),
    gantt: a.r.gantt.map(g => ({ pid:g.pid, start:g.start, end:g.end }))
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'scheduling_results.json'; a.click();
  URL.revokeObjectURL(url);
}
function exportImage() {
  const el = document.getElementById('results');
  const blob = new Blob([el.innerText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'scheduling_results.txt'; a.click();
  URL.revokeObjectURL(url);
}

/* ══════════════════════════════════════════════════════
   CPU Scheduling Algorithms
   ══════════════════════════════════════════════════════ */

// ─── FCFS ─────────────────────────────────────────────
function fcfs(p) {
  let procs = p.map(x => ({ ...x })).sort((a, b) => a.at - b.at || a.pid - b.pid);
  let t = 0, gantt = [], cs = 0;
  for (let x of procs) {
    if (t < x.at) { gantt.push({ pid: 'idle', start: t, end: x.at }); t = x.at; }
    x.wt = t - x.at; x.start = t; x.rt = x.wt;
    gantt.push({ pid: x.pid, start: t, end: t + x.bt });
    t += x.bt; x.tat = x.wt + x.bt; x.ct = t;
    if (gantt.length > 1) cs++;
  }
  return { procs, gantt, cs };
}

// ─── SJF (Non-Preemptive) ─────────────────────────────
function sjf(p) {
  let procs = p.map(x => ({ ...x, done: false })), t = 0, done = 0, gantt = [], cs = 0;
  while (done < procs.length) {
    let avail = procs.filter(x => !x.done && x.at <= t);
    if (!avail.length) { t++; continue; }
    avail.sort((a, b) => a.bt - b.bt || a.at - b.at);
    let x = avail[0];
    if (gantt.length && gantt[gantt.length - 1].pid !== x.pid) cs++;
    if (!gantt.length || gantt[gantt.length - 1].pid !== x.pid) gantt.push({ pid: x.pid, start: t, end: t });
    x.wt = t - x.at; x.start = t; x.rt = x.wt;
    t += x.bt; gantt[gantt.length - 1].end = t;
    x.tat = x.wt + x.bt; x.ct = t; x.done = true; done++;
  }
  return { procs, gantt, cs };
}

// ─── SRTF (Preemptive SJF) ───────────────────────────
function srtf(p) {
  let procs = p.map(x => ({ ...x, rem: x.bt, done: false, wt: 0, tat: 0, rt: -1 }));
  let t = 0, done = 0, gantt = [], cs = 0;
  let maxT = procs.reduce((s, x) => s + x.bt, 0) + Math.max(...procs.map(x => x.at)) + 2;
  while (done < procs.length && t <= maxT) {
    let avail = procs.filter(x => !x.done && x.at <= t);
    if (!avail.length) { t++; continue; }
    avail.sort((a, b) => a.rem - b.rem || a.at - b.at);
    let x = avail[0];
    if (x.rt === -1) x.rt = t - x.at;
    if (gantt.length && gantt[gantt.length - 1].pid !== x.pid) { cs++; gantt[gantt.length - 1].preempt = true; }
    if (!gantt.length || gantt[gantt.length - 1].pid !== x.pid) gantt.push({ pid: x.pid, start: t, end: t + 1 });
    else gantt[gantt.length - 1].end++;
    x.rem--; t++;
    if (x.rem === 0) { x.done = true; done++; x.tat = t - x.at; x.wt = x.tat - x.bt; x.ct = t; }
  }
  return { procs, gantt, cs };
}

// ─── Priority (Non-Preemptive) ────────────────────────
function priorityNP(p) {
  let procs = p.map(x => ({ ...x, done: false })), t = 0, done = 0, gantt = [], cs = 0;
  while (done < procs.length) {
    let avail = procs.filter(x => !x.done && x.at <= t);
    if (!avail.length) { t++; continue; }
    avail.sort((a, b) => a.pr - b.pr || a.at - b.at);
    let x = avail[0];
    if (t < x.at) { gantt.push({ pid: 'idle', start: t, end: x.at }); t = x.at; }
    if (gantt.length) cs++;
    x.wt = t - x.at; x.start = t; x.rt = x.wt;
    gantt.push({ pid: x.pid, start: t, end: t + x.bt });
    t += x.bt; x.tat = x.wt + x.bt; x.ct = t; x.done = true; done++;
  }
  return { procs, gantt, cs };
}

// ─── Round Robin ──────────────────────────────────────
function roundRobin(p, q) {
  let procs = p.map(x => ({ ...x, rem: x.bt, wt: 0, tat: 0, done: false, rt: -1 }));
  procs.sort((a, b) => a.at - b.at || a.pid - b.pid);
  let t = 0, gantt = [], queue = [], idx = 0, n = procs.length, cs = 0;
  while (true) {
    while (idx < n && procs[idx].at <= t) { queue.push(procs[idx]); idx++; }
    if (!queue.length) { if (idx >= n) break; t = procs[idx].at; queue.push(procs[idx]); idx++; }
    let x = queue.shift();
    if (x.rt === -1) x.rt = t - x.at;
    let exec = Math.min(x.rem, q);
    if (gantt.length) cs++;
    gantt.push({ pid: x.pid, start: t, end: t + exec });
    t += exec; x.rem -= exec;
    while (idx < n && procs[idx].at <= t) { queue.push(procs[idx]); idx++; }
    if (x.rem > 0) { queue.push(x); gantt[gantt.length - 1].preempt = true; }
    else { x.done = true; x.tat = t - x.at; x.wt = x.tat - x.bt; x.ct = t; }
    if (!queue.length && idx >= n) break;
  }
  return { procs, gantt, cs };
}

// ─── MLFQ (Multilevel Feedback Queue) ─────────────────
function mlfq(p) {
  const QUANTA = [4, 8, 16]; // Time quanta for each queue level
  const AGING_THRESHOLD = 15; // Promote after waiting this long
  const NUM_QUEUES = QUANTA.length;

  let procs = p.map(x => ({
    ...x, rem: x.bt, done: false, wt: 0, tat: 0, rt: -1,
    queueLevel: 0, // Start at highest priority queue
    lastRun: 0,
    waitingSince: 0
  }));
  procs.sort((a, b) => a.at - b.at || a.pid - b.pid);

  let queues = Array.from({ length: NUM_QUEUES }, () => []);
  let t = 0, done = 0, gantt = [], cs = 0, idx = 0;
  let queueHistory = []; // Track queue movements
  let maxT = procs.reduce((s, x) => s + x.bt, 0) + Math.max(...procs.map(x => x.at)) + 50;

  while (done < procs.length && t <= maxT) {
    // Add newly arrived processes to queue 0
    while (idx < procs.length && procs[idx].at <= t) {
      queues[0].push(procs[idx]);
      procs[idx].waitingSince = t;
      queueHistory.push({ pid: procs[idx].pid, time: t, from: -1, to: 0, reason: 'arrival' });
      idx++;
    }

    // Aging: promote processes that have waited too long
    for (let q = 1; q < NUM_QUEUES; q++) {
      for (let i = queues[q].length - 1; i >= 0; i--) {
        if (t - queues[q][i].waitingSince >= AGING_THRESHOLD) {
          let proc = queues[q].splice(i, 1)[0];
          proc.queueLevel = q - 1;
          proc.waitingSince = t;
          queues[q - 1].push(proc);
          queueHistory.push({ pid: proc.pid, time: t, from: q, to: q - 1, reason: 'aging' });
        }
      }
    }

    // Find highest priority non-empty queue
    let currentQueue = -1;
    for (let q = 0; q < NUM_QUEUES; q++) {
      if (queues[q].length > 0) { currentQueue = q; break; }
    }

    if (currentQueue === -1) {
      t++;
      continue;
    }

    let x = queues[currentQueue].shift();
    if (x.rt === -1) x.rt = t - x.at;

    let quantum = QUANTA[currentQueue];
    let exec = Math.min(x.rem, quantum);

    if (gantt.length && gantt[gantt.length - 1].pid !== x.pid) cs++;
    gantt.push({ pid: x.pid, start: t, end: t + exec, queueLevel: currentQueue, quantum: quantum });

    t += exec;
    x.rem -= exec;
    x.lastRun = t;

    // Add newly arrived during execution
    while (idx < procs.length && procs[idx].at <= t) {
      queues[0].push(procs[idx]);
      procs[idx].waitingSince = t;
      queueHistory.push({ pid: procs[idx].pid, time: t, from: -1, to: 0, reason: 'arrival' });
      idx++;
    }

    if (x.rem === 0) {
      x.done = true; done++; x.tat = t - x.at; x.wt = x.tat - x.bt; x.ct = t;
    } else if (exec >= quantum && currentQueue < NUM_QUEUES - 1) {
      // Used full quantum → demote
      x.queueLevel = currentQueue + 1;
      x.waitingSince = t;
      queues[currentQueue + 1].push(x);
      gantt[gantt.length - 1].preempt = true;
      queueHistory.push({ pid: x.pid, time: t, from: currentQueue, to: currentQueue + 1, reason: 'demotion' });
    } else {
      // Yielded early or already at lowest → stay
      x.waitingSince = t;
      queues[currentQueue].push(x);
      if (x.rem > 0) gantt[gantt.length - 1].preempt = true;
    }
  }

  return { procs, gantt, cs, queueHistory, quanta: QUANTA, numQueues: NUM_QUEUES };
}

// ─── CFS (Completely Fair Scheduler) ──────────────────
function cfs(p) {
  // Nice values map to weights (simplified Linux CFS weights)
  const NICE_TO_WEIGHT = {
    1: 1024, 2: 820, 3: 655, 4: 526, 5: 423,
    6: 335, 7: 272, 8: 215, 9: 172, 10: 137
  };
  const MIN_GRANULARITY = 1; // Minimum time slice
  const TARGET_LATENCY = 6;  // Target scheduling period

  let procs = p.map(x => ({
    ...x, rem: x.bt, done: false, wt: 0, tat: 0, rt: -1,
    vruntime: 0,
    weight: NICE_TO_WEIGHT[Math.min(x.pr, 10)] || 423,
    nice: x.pr
  }));
  procs.sort((a, b) => a.at - b.at || a.pid - b.pid);

  let t = 0, done = 0, gantt = [], cs = 0, idx = 0;
  let vruntimeLog = []; // For visualization
  let readyQueue = [];
  let maxT = procs.reduce((s, x) => s + x.bt, 0) + Math.max(...procs.map(x => x.at)) + 50;

  while (done < procs.length && t <= maxT) {
    // Add newly arrived
    while (idx < procs.length && procs[idx].at <= t) {
      let proc = procs[idx];
      // New process gets min vruntime of ready queue to be fair
      if (readyQueue.length > 0) {
        proc.vruntime = Math.min(...readyQueue.map(p => p.vruntime));
      }
      readyQueue.push(proc);
      idx++;
    }

    if (!readyQueue.length) { t++; continue; }

    // Pick process with smallest vruntime (red-black tree simulation)
    readyQueue.sort((a, b) => a.vruntime - b.vruntime || a.at - b.at);
    let x = readyQueue.shift();

    if (x.rt === -1) x.rt = t - x.at;

    // Calculate time slice proportional to weight
    let totalWeight = readyQueue.reduce((s, p) => s + p.weight, 0) + x.weight;
    let timeSlice = Math.max(MIN_GRANULARITY, Math.round(TARGET_LATENCY * x.weight / totalWeight));
    let exec = Math.min(x.rem, timeSlice);

    if (gantt.length && gantt[gantt.length - 1].pid !== x.pid) cs++;
    gantt.push({
      pid: x.pid, start: t, end: t + exec,
      vruntime: x.vruntime.toFixed(2),
      weight: x.weight,
      timeSlice: timeSlice
    });

    // Update vruntime: inversely proportional to weight
    x.vruntime += exec * (1024 / x.weight);
    t += exec;
    x.rem -= exec;

    // Log vruntime for all processes at this point
    let logEntry = { time: t };
    procs.forEach(proc => { logEntry['P' + proc.pid] = proc.vruntime; });
    vruntimeLog.push(logEntry);

    // Add newly arrived during execution
    while (idx < procs.length && procs[idx].at <= t) {
      let proc = procs[idx];
      if (readyQueue.length > 0) {
        proc.vruntime = Math.min(...readyQueue.map(p => p.vruntime), x.vruntime);
      } else {
        proc.vruntime = x.vruntime;
      }
      readyQueue.push(proc);
      idx++;
    }

    if (x.rem === 0) {
      x.done = true; done++; x.tat = t - x.at; x.wt = x.tat - x.bt; x.ct = t;
    } else {
      readyQueue.push(x);
      if (exec >= timeSlice) gantt[gantt.length - 1].preempt = true;
    }
  }

  return { procs, gantt, cs, vruntimeLog };
}

// ─── Lottery Scheduling ───────────────────────────────
function lottery(p) {
  // Tickets based on inverse priority (lower priority number = more tickets)
  const BASE_TICKETS = 100;

  let procs = p.map(x => ({
    ...x, rem: x.bt, done: false, wt: 0, tat: 0, rt: -1,
    tickets: Math.max(10, BASE_TICKETS - (x.pr - 1) * 15)
  }));
  procs.sort((a, b) => a.at - b.at || a.pid - b.pid);

  // Seeded random for reproducibility
  let seed = 42;
  function seededRandom() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  let t = 0, done = 0, gantt = [], cs = 0, idx = 0;
  let drawHistory = []; // Record draws for visualization
  let readyQueue = [];
  let maxT = procs.reduce((s, x) => s + x.bt, 0) + Math.max(...procs.map(x => x.at)) + 50;
  const TIME_SLICE = 2; // Fixed time slice for lottery

  while (done < procs.length && t <= maxT) {
    while (idx < procs.length && procs[idx].at <= t) {
      readyQueue.push(procs[idx]); idx++;
    }

    // Remove done processes from ready queue
    readyQueue = readyQueue.filter(x => !x.done);

    if (!readyQueue.length) { t++; continue; }

    // Calculate total tickets
    let totalTickets = readyQueue.reduce((s, x) => s + x.tickets, 0);

    // Draw a random ticket
    let winning = Math.floor(seededRandom() * totalTickets);
    let cumulative = 0;
    let winner = readyQueue[0];
    for (let proc of readyQueue) {
      cumulative += proc.tickets;
      if (winning < cumulative) { winner = proc; break; }
    }

    drawHistory.push({
      time: t,
      winner: winner.pid,
      ticket: winning,
      total: totalTickets,
      distribution: readyQueue.map(x => ({ pid: x.pid, tickets: x.tickets, pct: (x.tickets / totalTickets * 100).toFixed(1) }))
    });

    if (winner.rt === -1) winner.rt = t - winner.at;

    let exec = Math.min(winner.rem, TIME_SLICE);
    if (gantt.length && gantt[gantt.length - 1].pid !== winner.pid) cs++;
    gantt.push({
      pid: winner.pid, start: t, end: t + exec,
      tickets: winner.tickets,
      winningTicket: winning,
      totalTickets: totalTickets
    });

    t += exec;
    winner.rem -= exec;

    while (idx < procs.length && procs[idx].at <= t) {
      readyQueue.push(procs[idx]); idx++;
    }

    if (winner.rem === 0) {
      winner.done = true; done++; winner.tat = t - winner.at; winner.wt = winner.tat - winner.bt; winner.ct = t;
    } else if (exec >= TIME_SLICE) {
      gantt[gantt.length - 1].preempt = true;
    }
  }

  return { procs, gantt, cs, drawHistory };
}

// ─── Utility ──────────────────────────────────────────
function avg(arr, key) { return arr.length ? arr.reduce((s, x) => s + x[key], 0) / arr.length : 0; }
function cpuUtil(gantt) {
  if (!gantt.length) return 0;
  let total = gantt[gantt.length - 1].end - gantt[0].start;
  let busy = gantt.filter(g => g.pid !== 'idle').reduce((s, g) => s + (g.end - g.start), 0);
  return total > 0 ? (busy / total * 100) : 0;
}

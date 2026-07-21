# CPU Scheduler Pro ⚡

Live link: https://hareshgavit189.github.io/CPU-Scheduling-and-Visualization-Tool/

**CPU Scheduler Pro** is an advanced, premium, and interactive web-based simulator for Operating System process scheduling algorithms. It provides a visual and intuitive way to understand how different CPU scheduling strategies work, complete with real-time Gantt charts, detailed process metrics, and side-by-side algorithm comparisons.

## ✨ Features

- **8 Scheduling Algorithms Supported**:
  - First-Come, First-Served (FCFS)
  - Shortest Job First (SJF) - Non-Preemptive
  - Shortest Remaining Time First (SRTF) - Preemptive
  - Priority Scheduling (Non-Preemptive)
  - Round Robin (RR)
  - Multilevel Feedback Queue (MLFQ)
  - Completely Fair Scheduler (CFS)
  - Lottery Scheduling
- **Interactive Visualizations**:
  - Dynamic Gantt charts with detailed tooltips and preemption markers.
  - MLFQ queue structure and process movement visualization.
  - CFS Virtual Runtime (vruntime) progression graph.
  - Lottery ticket distribution wheel and draw history.
- **Side-by-Side Comparison**: Run all algorithms at once to automatically determine the most efficient strategy, or compare two specific algorithms side-by-side.
- **Detailed Metrics**: View Average Waiting Time, Average Turnaround Time, Average Response Time, CPU Utilization, and Context Switches.
- **Premium UI/UX**:
  - Gorgeous "Aurora/Cyberpunk" aesthetic with glassmorphism and smooth animations.
  - Interactive particle background.
  - Built-in **Dark / Light Mode** toggle with seamless transitions and local storage persistence.
- **Export Data**: Export simulation results and metrics to JSON or Text formats.

## 🚀 How to Run

This project is built using pure **HTML, CSS, and Vanilla JavaScript**, which means no server or build process is required!

1. Clone or download the repository to your local machine.
2. Open the `index.html` file in any modern web browser.
3. Add processes, adjust burst times, priorities, and arrival times in the left sidebar.
4. Click **Run All Algorithms** to start the simulation!

## 📂 File Structure

- `index.html` — The main interface, layout structure, and DOM manipulation scripts.
- `styles.css` — The complete design system, including responsive layouts, animations, and the dual Dark/Light theme variables.
- `algorithms.js` — The core logic and implementation for all 8 scheduling algorithms.
- `visualizations.js` — Canvas rendering and charting logic for Gantt charts, MLFQ queues, CFS graphs, and Lottery wheels.

## 🎨 Technologies Used

- **HTML5**
- **CSS3** (CSS Variables, Flexbox, Grid, Animations, Glassmorphism)
- **Vanilla JavaScript** (ES6+)
- **HTML5 Canvas API** (for advanced visualizations)

## 🤝 Contributing

Feel free to fork this project, submit pull requests, or open issues if you find any bugs or have suggestions for new features (e.g., adding more algorithms like HRRN or LIFO).

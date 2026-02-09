# Agent-Pulse 🦞🛰️

**Agent-Pulse** is a high-fidelity, real-time "Mission Control" dashboard for headless AI agents. It bridges the visibility gap by providing a visual broadcast of an agent's internal logic, system vitals, and visual renders.

## 🚀 Features

*   **Live Logic Trace**: Real-time streaming of agent thoughts and actions via Server-Sent Events (SSE).
*   **Visual Pulse Buffer**: A persistent canvas area for displaying screenshots, UI mockups, or data visualizations.
*   **System Vitals**: Live hardware telemetry (CPU, Temp, RAM) streamed directly from the host.
*   **Aura Manager**: An identity engine to swap agent personas and dashboard themes on the fly.
*   **Hybrid Persistence**: History and visual state survive page refreshes and server restarts.
*   **Agent-Agnostic**: Any script (Python, Bash, Node) can "pulse" its status via a simple HTTP POST.

## 🛠️ Architecture

*   **Frontend**: Next.js 16 (App Router), Tailwind CSS, Framer Motion.
*   **Backend**: SSE Bridge with local JSON history buffering.
*   **Daemons**:
    *   `pulse_daemon.sh`: Monitors system logs and broadcasts them.
    *   `vitals_daemon.sh`: Scrapes hardware telemetry every 5 seconds.

## 📡 Pulse Protocol

Agents can link to the dashboard by sending a JSON payload to `http://localhost:8088/api/pulse`:

### Example Log
```bash
curl -X POST http://localhost:8088/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"agent": "Clawdy", "action": "PROCESS", "message": "Analyzing data...", "type": "log"}'
```

### Example Visual
```bash
curl -X POST http://localhost:8088/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"type": "visual", "payload": "render.png"}'
```

## 📦 Setup & Installation

1.  **Clone & Install**:
    ```bash
    npm install
    ```
2.  **Build & Start**:
    ```bash
    npm run build
    ```
3.  **Deploy Port 8088**:
    ```bash
    npx next start -p 8088
    ```
4.  **Start Daemons**:
    ```bash
    ./scripts/pulse_daemon.sh &
    ./scripts/vitals_daemon.sh &
    ```

## 🛡️ License
MIT License. Created by Satyaa & Clawdy.

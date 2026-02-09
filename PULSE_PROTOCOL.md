# Agent-Pulse Protocol (v1.0)

This document defines how any AI agent or system service can link with the **Agent-Pulse Dashboard**.

## 1. Core Endpoints
All interactions happen via HTTP POST to the Pulse API:
`POST http://localhost:8088/api/pulse`

## 2. Event Types

### A. Logic Pulse (Logs)
Use this to stream thoughts, actions, or status updates to the "Logic Trace".
```json
{
  "agent": "My-Cool-Bot",
  "action": "PROCESS",
  "message": "Analyzing data from source...",
  "type": "log"
}
```

### B. Visual Pulse (Canvas)
Use this to update the main viewport with a visual render (screenshot, chart, etc.).
The image MUST be located in `/mnt/ramdisk/`.
```json
{
  "type": "visual",
  "payload": "render_name.png"
}
```

### C. Vitals Pulse
Use this to stream hardware telemetry.
```json
{
  "type": "vitals",
  "payload": {
    "cpu": "15%",
    "temp": "45°C",
    "ram": "4GB / 16GB"
  }
}
```

## 3. Implementation (Quick Start)

### Python
```python
import requests
requests.post('http://localhost:8088/api/pulse', json={
    "agent": "Python-Bot",
    "action": "HEARTBEAT",
    "message": "Alive and kicking!",
    "type": "log"
})
```

### Bash
```bash
curl -X POST http://localhost:8088/api/pulse \
  -H "Content-Type: application/json" \
  -d '{"agent": "Bash-Bot", "action": "ALERT", "message": "Disk low!", "type": "log"}'
```

## 4. Hardware Portability
Agent-Pulse is **not** specific to the Raspberry Pi 5. While the default `vitals_daemon.sh` uses Pi-specific commands (`vcgencmd`), the API accepts generic string data for vitals. 

To run on a Standard Linux Server/Laptop:
1. Update `vitals_daemon.sh` to use `sensors` or `/proc/acpi` for temperature.
2. The core dashboard and SSE bridge will work without changes.

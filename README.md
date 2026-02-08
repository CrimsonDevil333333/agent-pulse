# Agent-Pulse 🦞🌌

A real-time, Next.js-powered "Live Face" for headless AI agents.

## Overview
Agent-Pulse provides a visual dashboard for agents running on headless servers (like the Raspberry Pi 5). It allows the agent to broadcast its internal "Thoughts," current "Actions," and high-fidelity "Visual Renders" (screenshots/Canvas) to a dedicated port.

## Core Features
- **Live Logic Trace**: Real-time streaming of agent activity via Server-Sent Events (SSE).
- **Visual Viewport**: Displays screenshots, UI prototypes (like Apt Aura), and Canvas renders.
- **Mission Control UI**: A modern, dark-mode dashboard built with Tailwind CSS.
- **System Vitals**: Real-time monitoring of Pi5 hardware (CPU, Temp, RAM).
- **Agent-First API**: Simple `POST` endpoints for agents to push updates from any script.

## Technical Stack
- **Framework**: Next.js 15+ (App Router)
- **Styling**: Tailwind CSS
- **Real-time**: Server-Sent Events (SSE) or WebSockets
- **Type Safety**: TypeScript
- **Deployment**: Local Node.js server on Pi5 (Port 8088 by default)

## Getting Started
1. Install dependencies: `npm install`
2. Start development: `npm run dev`
3. Push data to the pulse: `curl -X POST http://localhost:8088/api/pulse -d '{"action": "THINKING", "message": "Analyzing logs..."}'`

---
Created by [Satyaa](https://github.com/CrimsonDevil333333) & [Clawdy](https://openclaw.ai). 🦞✨

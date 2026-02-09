#!/bin/bash
# scripts/vitals_daemon.sh
# Collects Pi5 vitals and pulses them to Agent-Pulse every 5 seconds.

API_URL="http://localhost:8088/api/pulse"

while true; do
  # Get CPU Load (Generic Linux)
  CPU=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}' | head -n 1)
  
  # Get Temperature (Pi-specific fallback to generic)
  if command -v vcgencmd >/dev/null 2>&1; then
    TEMP=$(vcgencmd measure_temp | cut -d'=' -f2)
  elif [ -f /sys/class/thermal/thermal_zone0/temp ]; then
    TEMP=$(awk '{print $1/1000 "°C"}' /sys/class/thermal/thermal_zone0/temp)
  else
    TEMP="N/A"
  fi
  
  # Get RAM Usage (Generic Linux)
  RAM=$(free -h | grep Mem | awk '{print $3 " / " $2}')

  # Pulse the data
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"type\": \"vitals\", \"payload\": {\"cpu\": \"$CPU\", \"temp\": \"$TEMP\", \"ram\": \"$RAM\"}}" > /dev/null

  sleep 5
done

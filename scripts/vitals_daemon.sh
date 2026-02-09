#!/bin/bash
# scripts/vitals_daemon.sh
# Collects Pi5 vitals and pulses them to Agent-Pulse every 5 seconds.

API_URL="http://localhost:8088/api/pulse"

while true; do
  # Get CPU Load
  CPU=$(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print 100 - $1"%"}')
  
  # Get Temperature (Pi specific)
  TEMP=$(vcgencmd measure_temp | cut -d'=' -f2)
  
  # Get RAM Usage
  RAM=$(free -h | grep Mem | awk '{print $3 " / " $2}')

  # Pulse the data
  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"type\": \"vitals\", \"payload\": {\"cpu\": \"$CPU\", \"temp\": \"$TEMP\", \"ram\": \"$RAM\"}}" > /dev/null

  sleep 5
done

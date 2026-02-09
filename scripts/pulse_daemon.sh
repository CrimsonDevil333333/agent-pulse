#!/bin/bash
# scripts/pulse_daemon.sh
# This script tails a log file and broadcasts every line to Agent-Pulse.

LOG_FILE="/mnt/ramdisk/system_pulse.log"
API_URL="http://localhost:8088/api/pulse"

# Create log if it doesn't exist
touch "$LOG_FILE"

echo "Pulse Daemon Started. Monitoring $LOG_FILE..."

tail -F "$LOG_FILE" | while read -r line; do
  # Extract action and message if formatted as ACTION: MESSAGE
  if [[ "$line" =~ ^([A-Z_]+):\ (.*)$ ]]; then
    ACTION="${BASH_REMATCH[1]}"
    MESSAGE="${BASH_REMATCH[2]}"
  else
    ACTION="TRACE"
    MESSAGE="$line"
  fi

  curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "{\"agent\": \"SYSTEM\", \"action\": \"$ACTION\", \"message\": \"$MESSAGE\", \"type\": \"log\"}" > /dev/null
done

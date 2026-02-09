#!/bin/bash
# scripts/aura_monitor.sh
# Monitors last_aura.json and alerts the human/main session if it changes via dashboard.

AURA_FILE="/mnt/ramdisk/last_aura.json"
LAST_HASH=""

while true; do
  if [ -f "$AURA_FILE" ]; then
    CURRENT_HASH=$(md5sum "$AURA_FILE" | awk '{print $1}')
    if [ "$CURRENT_HASH" != "$LAST_HASH" ]; then
      if [ "$LAST_HASH" != "" ]; then
        PERSONA=$(jq -r '.payload.name // .payload.persona' "$AURA_FILE")
        MOOD=$(jq -r '.payload.mood' "$AURA_FILE")
        echo "AURA_SHIFT: Personality synced to $PERSONA ($MOOD)" >> /mnt/ramdisk/system_pulse.log
        
        # PROACTIVE NOTIFICATION: Send a confirmation message to the dashboard trace
        curl -s -X POST "http://localhost:8088/api/pulse" \
          -H "Content-Type: application/json" \
          -d "{\"agent\": \"$PERSONA\", \"action\": \"CONFIRM\", \"message\": \"I have successfully assumed the $PERSONA identity. All protocols updated.\", \"type\": \"log\"}" > /dev/null
      fi
      LAST_HASH="$CURRENT_HASH"
    fi
  fi
  sleep 2
done

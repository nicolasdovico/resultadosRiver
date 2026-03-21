#!/bin/bash

# Configuration
TASK_FILE="docs/tasks.md"
PROGRESS_FILE="docs/progress.txt"
LOOP_INSTRUCTIONS="docs/task-loop.md"
LOG_FILE="ralph-log.md"
COMPLETION_SIGNAL="<promise>COMPLETE</promise>"
MAX_ITERATIONS=50
ITERATION=0
MODEL="gemini-2.5-flash"

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting RALPH loop with model $MODEL..."

# Initialize log if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "Status: STARTING" > "$LOG_FILE"
fi

# THE LOOP
#while :; do
    # 1. Check for Completion Signal in the log
    if grep -q "$COMPLETION_SIGNAL" "$LOG_FILE"; then
        echo -e "${GREEN}✅ Completion signal found. All tasks done.${NC}"
        break
    fi

    # 2. Check Iteration Limit
    ((ITERATION++))
    if [ $ITERATION -gt $MAX_ITERATIONS ]; then
        echo -e "${RED}⚠️ Max iterations ($MAX_ITERATIONS) reached. Stopping loop.${NC}"
        break
    fi

    echo "🔄 Iteration $ITERATION..."

    # 3. Log Rotation (Keep last 100 lines)
    if [ -f "$LOG_FILE" ]; then
        tail -n 100 "$LOG_FILE" > "$LOG_FILE.tmp" && mv "$LOG_FILE.tmp" "$LOG_FILE"
    fi

    # 4. Construct the Dynamic Prompt
    PROMPT="
    *** RALPH MODE ACTIVE ***
    
    CORE METHODOLOGY:
    $(cat $LOOP_INSTRUCTIONS)
    
    CURRENT TASKS:
    $(cat $TASK_FILE)
    
    RECENT PROGRESS:
    $(cat $PROGRESS_FILE)
    
    RUNTIME LOG (Last 100 lines):
    $(cat $LOG_FILE)
    
    INSTRUCTION: 
    1. Read the methodology in docs/task-loop.md.
    2. Identify the next incomplete task in docs/tasks.md.
    3. Implement it, run tests via Docker, and commit.
    4. Update docs/tasks.md and docs/progress.txt.
    5. Append a brief summary to $LOG_FILE.
    6. Stop code after a commit and wait for instructions for the next task.
    "

    # 5. Execute Gemini CLI
    # --yolo: Auto-execute tools
    # --model: Use specified model
    echo "🔄 Executing Gemini..."
    
    echo "$PROMPT" # | gemini --model "$MODEL" >> "$LOG_FILE" 2>&1

    # 6. Rate Limit Backoff
#    sleep 5
#done

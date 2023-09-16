#!/bin/bash

COUNT=${1:-1000}
DATASIZE=${2:-100}

# Prepare random data once to reuse
RANDOM_DATA=$(head -c $DATASIZE </dev/urandom | base64)

# Function to display progress
progress_indicator() {
  local count=$1
  local interval=$((COUNT / 10))  # Adjust for larger or smaller counts
  
  # Ensure interval is never zero
  [[ $interval -eq 0 ]] && interval=1

  if ((count % interval == 0)); then
    printf "."
  fi
}

# Get current time in milliseconds
current_time_ms() {
  perl -e 'use Time::HiRes qw(time); print int(time*1000)'
}

# Measure SET operations
echo "Starting SET operations..."
START_SET=$(current_time_ms)
for i in $(seq 1 $COUNT); do
    echo "SET key$i $RANDOM_DATA" | redis-cli > /dev/null
    progress_indicator $i
done
END_SET=$(current_time_ms)
DURATION_SET=$((END_SET - START_SET))
echo -e "\nAverage SET time: $((DURATION_SET * 1000 / COUNT)) microseconds"

# Measure GET operations
echo "Starting GET operations..."
START_GET=$(current_time_ms)
for i in $(seq 1 $COUNT); do
    echo "GET key$i" | redis-cli > /dev/null
    progress_indicator $i
done
END_GET=$(current_time_ms)
DURATION_GET=$((END_GET - START_GET))
echo -e "\nAverage GET time: $((DURATION_GET * 1000 / COUNT)) microseconds"

# Cleanup
echo "Cleaning up..."
for i in $(seq 1 $COUNT); do
    echo "DEL key$i" | redis-cli > /dev/null
done

echo "Benchmark completed!"

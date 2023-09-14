#!/bin/bash

COUNT=${1:-10000}  # number of commands to run, default is 1000
DATASIZE=${2:-10000}  # default data size is 100 bytes

# Perform SET operations
for i in $(seq 1 $COUNT)
do
    echo -e "set key$i $(head -c $DATASIZE </dev/urandom | base64)" | redis-cli 
done 

# Perform GET operations
for i in $(seq 1 $COUNT)
do
    echo "get key$i" | redis-cli 
done 

# time ./benchmark.sh 1000 500
# Result: 7.75s user 10.86s system 127% cpu 14.582 total

# parallel -j 10 --ungroup time ./benchmark.sh 1000 ::: 100 200 500 1000
# Result: 8.08s user 13.18s system 103% cpu 20.484 total

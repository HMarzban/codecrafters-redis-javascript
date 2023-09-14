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

# ./benchmark.sh 1000 1000  7.24s user 12.55s system 103% cpu 19.101 total

# ./benchmark.sh 1000 1000  7.26s user 12.59s system 102% cpu 19.337 total
# (nil)
# ./benchmark.sh 1000 500  7.17s user 12.58s system 102% cpu 19.344 total

# ./benchmark.sh 1000 500  7.17s user 12.52s system 102% cpu 19.271 total

# parallel --ungroup time ./benchmark.sh 1000 ::: 100 200 500 1000

# parallel -j 10 --ungroup time ./benchmark.sh 1000 ::: 100 200 500 1000
# ./benchmark.sh 1000 1000  8.09s user 13.25s system 103% cpu 20.708 total

# Redis Result:
# ./benchmark.sh 1000 1000  8.09s user 13.29s system 95% cpu 22.417 total


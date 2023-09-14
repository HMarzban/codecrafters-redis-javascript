#!/bin/bash

pass_msg() {
    echo "✅ $1 passed."
}

fail_msg() {
    echo "❌ $1 failed."
}

# Basic SET
redis-cli SET mykey "Hello, Redis!"
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "Hello, Redis!" ]] && pass_msg "Basic SET" || fail_msg "Basic SET"

# EX option
redis-cli SET mykey "With EX" EX 2
sleep 3
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "" ]] && pass_msg "EX" || fail_msg "EX"

# PX option
redis-cli SET mykey "With PX" PX 2000
sleep 3
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "" ]] && pass_msg "PX" || fail_msg "PX"

# EXAT option
future_time=$(($(date +%s) + 2))
redis-cli SET mykey "With EXAT" EXAT $future_time
sleep 3
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "" ]] && pass_msg "EXAT" || fail_msg "EXAT"

# PXAT option
current_time_s=$(date +%s)
current_time_ms=$((current_time_s * 1000))
future_time_ms=$((current_time_ms + 2000))
redis-cli SET mykey "With PXAT" PXAT $future_time_ms
sleep 3
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "" ]] && pass_msg "PXAT" || fail_msg "PXAT"

# NX option
redis-cli SET mykey "Original Value"
redis-cli SET mykey "With NX" NX
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "Original Value" ]] && pass_msg "NX" || fail_msg "NX"

# XX option
redis-cli SET mykey "Original Value"
redis-cli SET mykey "With XX" XX
retrieved=$(redis-cli GET mykey)
[[ "$retrieved" == "With XX" ]] && pass_msg "XX" || fail_msg "XX"

# KEEPTTL option
redis-cli SET mykey "With TTL" EX 6
sleep 2
redis-cli SET mykey "With KEEPTTL" KEEPTTL
remaining_ttl=$(redis-cli TTL mykey)
if [[ $remaining_ttl -lt 6 && $remaining_ttl -gt 0 ]]; then
    pass_msg "KEEPTTL. TTL: $remaining_ttl"
else
    fail_msg "KEEPTTL. TTL: $remaining_ttl"
fi

# GET option
redis-cli SET mykey "Original Value"
old_value=$(redis-cli SET mykey "With GET" GET)
retrieved=$(redis-cli GET mykey)
if [[ "$old_value" == "Original Value" && "$retrieved" == "With GET" ]]; then
    pass_msg "GET option. Old: $old_value, New: $retrieved"
else
    fail_msg "GET option. Old: $old_value, New: $retrieved"
fi

# Cleanup
redis-cli DEL mykey

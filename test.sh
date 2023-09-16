#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

pass_msg() {
    echo -e "${GREEN}✅ $1 passed.${NC}"
}

fail_msg() {
    echo -e "${RED}❌ $1 failed.${NC}"
    exit 1
}

set_key() {
    redis-cli SET "$@"
}

get_key() {
    redis-cli GET "$1"
}

check_value() {
    local key="$1"
    local expected="$2"
    local name="$3"
    retrieved=$(get_key "$key")
    [[ "$retrieved" == "$expected" ]] && pass_msg "$name" || fail_msg "$name"
}

cleanup() {
    redis-cli DEL mykey
}

echo "Starting tests..."

# Basic SET
set_key mykey "Hello, Redis!"
check_value mykey "Hello, Redis!" "Basic SET"

# EX option
set_key mykey "With EX" EX 2
sleep 3
check_value mykey "" "EX"

# PX option
set_key mykey "With PX" PX 2000
sleep 3
check_value mykey "" "PX"

# EXAT option
future_time=$(($(date +%s) + 2))
set_key mykey "With EXAT" EXAT $future_time
sleep 3
check_value mykey "" "EXAT"

# PXAT option
current_time_ms=$(($(date +%s) * 1000))
future_time_ms=$((current_time_ms + 2000))
set_key mykey "With PXAT" PXAT $future_time_ms
sleep 3
check_value mykey "" "PXAT"

# NX option
set_key mykey "Original Value"
set_key mykey "With NX" NX
check_value mykey "Original Value" "NX"

# XX option
set_key mykey "Original Value"
set_key mykey "With XX" XX
check_value mykey "With XX" "XX"

# KEEPTTL option
set_key mykey "With TTL" EX 6
sleep 2
set_key mykey "With KEEPTTL" KEEPTTL
remaining_ttl=$(redis-cli TTL mykey)
if [[ $remaining_ttl -lt 6 && $remaining_ttl -gt 0 ]]; then
    pass_msg "KEEPTTL. TTL: $remaining_ttl"
else
    fail_msg "KEEPTTL. TTL: $remaining_ttl"
fi

# GET option
set_key mykey "Original Value"
old_value=$(redis-cli SET mykey "With GET" GET)
retrieved=$(get_key mykey)
if [[ "$old_value" == "Original Value" && "$retrieved" == "With GET" ]]; then
    pass_msg "GET option. Old: $old_value, New: $retrieved"
else
    fail_msg "GET option. Old: $old_value, New: $retrieved"
fi

# 1. Multiple Simultaneous SETs
set_key key1 "Simultaneous"
set_key key2 "Simultaneous"
check_value key1 "Simultaneous" "Simultaneous SET (key1)"
check_value key2 "Simultaneous" "Simultaneous SET (key2)"
cleanup

# 2. Setting Large Values
large_val=$(printf 'A%.0s' {1..5000})
set_key largekey "$large_val"
check_value largekey "$large_val" "Large Value SET"
cleanup

# 3. Key Expiration Cascade
set_key early_expire "Early" EX 4
set_key late_expire "Late" EX 6
sleep 5
check_value early_expire "" "Early Expiration"
check_value late_expire "Late" "Late Expiration Still Exists"
cleanup

# 4. SET then DEL Combination
set_key tempkey "Temporary"
redis-cli DEL tempkey
check_value tempkey "" "DEL After SET"
cleanup

# 5. SET with Complex TTL Patterns
set_key ttlkey "With EX" EX 5
sleep 2
set_key ttlkey "With PX" PX 2000
sleep 3
check_value ttlkey "" "Complex TTL Patterns"
cleanup

# 6. Handling Non-existent Keys
retrieved=$(get_key "nonexistent")
[[ "$retrieved" == "" ]] && pass_msg "Handle Non-existent Key" || fail_msg "Handle Non-existent Key"
cleanup


# Cleanup
cleanup

echo -e "${GREEN}All tests completed successfully!${NC}"

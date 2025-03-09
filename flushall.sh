#!/bin/bash

# Flush all keys in the first Redis container
docker exec -it seng468-day-trading-redis1-1 redis-cli FLUSHALL

# Flush all keys in the second Redis container
docker exec -it seng468-day-trading-redis2-1 redis-cli FLUSHALL

echo "All keys flushed in both Redis containers."

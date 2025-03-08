#!/bin/bash

# Flush all Redis databases in each Redis container

docker exec -it seng468-day-trading-redis1-1 redis-cli FLUSHALL
docker exec -it seng468-day-trading-redis2-1 redis-cli FLUSHALL
docker exec -it seng468-day-trading-redis3-1 redis-cli FLUSHALL
docker exec -it seng468-day-trading-redis4-1 redis-cli FLUSHALL
docker exec -it seng468-day-trading-redis5-1 redis-cli FLUSHALL

echo "All Redis databases have been flushed."

#!/bin/bash

# Get all container IDs with names starting with "redis"
for container_id in $(docker ps --filter "name=redis" --format "{{.ID}}"); do
    # Run redis-cli flushall on each redis container
    docker exec "$container_id" redis-cli flushall
    echo "Flushed database on container $container_id"
done

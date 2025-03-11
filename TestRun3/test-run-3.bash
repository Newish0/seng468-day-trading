#!/usr/bin/env bash
#
# test-run-3.bash
# 
# 1. Clears the contents of stockIds.csv
# 2. Removes any JMeter result logs and the results/ folder
# 3. Flushes Redis data
# 4. Restarts all containers via Docker Compose
# 5. Runs the initial setup JMeter test
# 6. Runs the user test JMeter test
#

# --- 1. Clear stockIds.csv ---
echo "Clearing stockIds.csv ..."
rm -f ./jmeter/Config/stockIds.csv
touch ./jmeter/Config/stockIds.csv


# --- 2. Delete old JMeter logs and results ---
echo "Removing old logs and results..."
rm -f ./jmeter/10k_results.log
rm -f ./jmeter/10k_results.error.log.csv
rm -f ./jmeter/initial_setup_results.log
rm -rf ./jmeter/results

# --- 3. Flush Redis data ---
echo "Flushing Redis..."
# Get all container IDs with names starting with "redis"
#for container_id in $(docker ps --filter "name=redis" --format "{{.ID}}"); do
    # Run redis-cli flushall on each redis container
#    docker exec "$container_id" redis-cli flushall
#    echo "Flushed database on container $container_id"
#done

# --- 4. Restart containers ---
#echo "Restarting Docker containers..."
#docker compose down

#docker compose up -d

# --- 5. Run initial setup JMeter test ---
echo "Running InitialSetup.jmx..."
jmeter -n \
  -t ./jmeter/InitialSetup.jmx \
  -l ./jmeter/initial_setup_results.log

# --- 6. Run user test JMeter test ---
echo "Running UserThreadTest.jmx..."
jmeter -n \
  -t ./jmeter/UserThreadTest.jmx \
  -l ./jmeter/10k_results.log \
  -e -o ./jmeter/results

echo "Test run complete."

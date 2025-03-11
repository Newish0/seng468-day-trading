@echo off
REM Get all container IDs with names starting with "redis"
for /f "tokens=1" %%i in ('docker ps --filter "name=redis" --format "{{.ID}}"') do (
    REM Run redis-cli flushall on each redis container
    docker exec %%i redis-cli flushall
    echo Flushed database on container %%i
)

pause

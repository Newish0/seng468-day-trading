#!/bin/bash

# Define the base directory
BASE_DIR="/home/saibannur/seng468-day-trading/TestRun3"

# List of files to delete
FILES=(
    "$BASE_DIR/results.log"
    "$BASE_DIR/results2.log"
    "$BASE_DIR/jmeter.log"
)

# List of directories to delete
DIRECTORIES=(
    "$BASE_DIR/results"
    "$BASE_DIR/results2"
)

# File to clear (make empty)
FILE_TO_CLEAR="$BASE_DIR/Config/stockIds.csv"

# Delete files
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        rm "$file"
        echo "Deleted file: $file"
    else
        echo "File not found: $file"
    fi
done

# Delete directories
for dir in "${DIRECTORIES[@]}"; do
    if [ -d "$dir" ]; then
        rm -r "$dir"
        echo "Deleted directory: $dir"
    else
        echo "Directory not found: $dir"
    fi
done

# Clear the content of stockIds.csv
if [ -f "$FILE_TO_CLEAR" ]; then
    > "$FILE_TO_CLEAR"
    echo "Cleared content of: $FILE_TO_CLEAR"
else
    echo "File not found: $FILE_TO_CLEAR"
fi

echo "Cleanup completed."


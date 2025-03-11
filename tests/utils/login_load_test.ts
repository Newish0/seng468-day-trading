import { apiRequest, createUniqueUser } from "./index";

// Configuration
const config = {
  numberOfUsers: 10000, // Number of users to create
  concurrentBatchSize: 100, // How many users to create concurrently
};

async function runUserCreationTest() {
  try {
    console.log(`Starting user creation test for ${config.numberOfUsers} users...`);
    console.time("TotalTestTime");

    let successfulCreations = 0;
    let failedCreations = 0;
    const responseTimes: number[] = [];
    let minResponseTime = Number.MAX_SAFE_INTEGER;
    let maxResponseTime = 0;
    let totalResponseTime = 0;

    // Process users in batches
    for (let batchStart = 0; batchStart < config.numberOfUsers; batchStart += config.concurrentBatchSize) {
      const batchEnd = Math.min(batchStart + config.concurrentBatchSize, config.numberOfUsers);
      const batchPromises: Promise<any>[] = [];

      for (let i = batchStart; i < batchEnd; i++) {
        batchPromises.push(
          (async () => {
            try {
              const startTime = Date.now();
              
              // Create user
              const userResult = await createUniqueUser();
              
              const endTime = Date.now();
              const responseTime = endTime - startTime;

              // Update statistics
              responseTimes.push(responseTime);
              minResponseTime = Math.min(minResponseTime, responseTime);
              maxResponseTime = Math.max(maxResponseTime, responseTime);
              totalResponseTime += responseTime;
              successfulCreations++;

              return {
                username: userResult.user.user_name,
                responseTime,
                status: 'success'
              };
            } catch (error) {
              failedCreations++;
              return {
                status: 'failed',
                error: error.message || "Unknown error"
              };
            }
          })()
        );
      }

      // Execute batch
      await Promise.all(batchPromises);
      
      // Progress update
      console.log(`Processed ${batchEnd} out of ${config.numberOfUsers} users`);
    }

    // Calculate statistics
    const validResponseTimes = responseTimes.filter(t => t > 0);
    const averageResponseTime = validResponseTimes.length > 0
      ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
      : 0;

    // Print results
    console.log("\n=== USER CREATION TEST SUMMARY ===");
    console.log(`Total attempted: ${config.numberOfUsers}`);
    console.log(`Successful creations: ${successfulCreations}`);
    console.log(`Failed creations: ${failedCreations}`);
    console.log(`Failure rate: ${((failedCreations / config.numberOfUsers) * 100).toFixed(2)}%`);

    if (validResponseTimes.length > 0) {
      console.log("\n=== RESPONSE TIME STATISTICS ===");
      console.log(`Average response time: ${averageResponseTime.toFixed(2)} ms`);
      console.log(`Minimum response time: ${minResponseTime} ms`);
      console.log(`Maximum response time: ${maxResponseTime} ms`);
      console.log(`Response time range: ${maxResponseTime - minResponseTime} ms`);

      // Additional statistics
      validResponseTimes.sort((a, b) => a - b);
      const median = validResponseTimes[Math.floor(validResponseTimes.length / 2)];
      console.log(`Median response time: ${median} ms`);

      // Percentiles
      if (validResponseTimes.length >= 10) {
        const p90Index = Math.floor(validResponseTimes.length * 0.9);
        console.log(`90th percentile: ${validResponseTimes[p90Index]} ms`);
      }

      if (validResponseTimes.length >= 20) {
        const p95Index = Math.floor(validResponseTimes.length * 0.95);
        console.log(`95th percentile: ${validResponseTimes[p95Index]} ms`);
      }

      if (validResponseTimes.length >= 100) {
        const p99Index = Math.floor(validResponseTimes.length * 0.99);
        console.log(`99th percentile: ${validResponseTimes[p99Index]} ms`);
      }
    } else {
      console.log("No valid response times recorded.");
    }

    console.log("\nUser creation test completed");
    console.timeEnd("TotalTestTime");
  } catch (error) {
    console.error("Error in user creation test:", error);
  }
}

// Run the test
runUserCreationTest();
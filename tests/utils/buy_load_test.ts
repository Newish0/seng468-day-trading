import { apiRequest, createUniqueUser, withAuth } from "./index";

// Configuration
const config = {
  numberOfBuyUsers: 10000, // Controllable parameter n
  sharesPerStock: 50000000, // 50 million shares
  stockPrice: 1, // $1 per share
  userFundingAmount: 2000000, // $2 million per user
  verificationDelay: 500, // ms to wait before checking transaction status
};

// Helper functions
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomStock(stocks: string[]): string {
  return stocks[Math.floor(Math.random() * stocks.length)];
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Main execution function
async function runTradingSimulation() {
  try {
    console.log(`Starting trading simulation with ${config.numberOfBuyUsers} buy users...`);
    console.time("TotalSimulationTime");

    // Step 1: Create boss seller user
    console.log("Creating boss seller user...");
    const bossSellerResult = await createUniqueUser();
    const bossSeller = {
      id: "bossSeller",
      token: bossSellerResult.token,
      ...bossSellerResult.user,
    };
    console.log(`Boss Seller created: ${bossSeller.user_name}`);

    // Step 2: Fund boss seller wallet
    console.log("Funding boss seller wallet...");
    await apiRequest(
      "POST",
      "/transaction/addMoneyToWallet",
      { amount: 10000000 }, // $10 million
      withAuth(bossSeller.token),
      true
    );
    console.log("Boss Seller wallet funded successfully");

    // Step 3: Create 2 stocks with boss seller
    console.log(`Creating 2 stocks...`);
    const stocks: string[] = [];

    for (let i = 0; i < 2; i++) {
      const stockResponse = await apiRequest(
        "POST",
        "/setup/createStock",
        { stock_name: `Stock-${i + 1}-${Date.now()}` },
        withAuth(bossSeller.token),
        true
      );

      const stockId: string = stockResponse.data.stock_id;
      stocks.push(stockId);
      console.log(`Created stock ${i + 1}: ${stockId}`);
    }

    // Step 4: Add 50 million shares of each stock to boss seller
    console.log("Adding stocks to boss seller's portfolio...");
    for (const stockId of stocks) {
      await apiRequest(
        "POST",
        "/setup/addStockToUser",
        {
          stock_id: stockId,
          quantity: config.sharesPerStock,
        },
        withAuth(bossSeller.token),
        true
      );
      console.log(`Added ${config.sharesPerStock} shares of stock ${stockId} to boss seller`);
    }

    // Step 5: Boss seller places limit sell orders for all shares
    console.log("Boss seller placing limit sell orders...");

    for (const stockId of stocks) {
      const sellOrderPayload = {
        stock_id: stockId,
        is_buy: false,
        order_type: "LIMIT",
        quantity: config.sharesPerStock,
        price: config.stockPrice,
      };

      const sellResponse = await apiRequest(
        "POST",
        "/engine/placeStockOrder",
        sellOrderPayload,
        withAuth(bossSeller.token)
      );

      console.log(`Placed sell order for stock ${stockId}`);
    }

    // Step 6, 7, and 8: Create users, fund them, and prepare buy orders
    console.log(`Preparing ${config.numberOfBuyUsers} buy users and their orders...`);

    // Create an array to store all user buy order promises
    const buyPromises: Promise<any>[] = [];

    // Statistics tracking
    let successfulOrders = 0;
    let failedOrders = 0;
    let completedMarketTransactions = 0;
    const responseTimes: number[] = [];
    let minResponseTime = Number.MAX_SAFE_INTEGER;
    let maxResponseTime = 0;
    let totalResponseTime = 0;

    // Create users and prepare their buy orders
    for (let i = 0; i < config.numberOfBuyUsers; i++) {
      // Using a closure to create user and generate order info
      const userOrderInfo = {
        userId: `buyer-${i + 1}`,
        stockId: getRandomStock(stocks),
        quantity: getRandomInt(1, 100),
      };

      // Push this user's complete process to our array
      // Note: We're only saving the promise, not executing it yet
      buyPromises.push(
        (async () => {
          try {
            // Step 6a: Create the buy user
            const userResult = await createUniqueUser();
            const user = {
              id: userOrderInfo.userId,
              token: userResult.token,
              ...userResult.user,
            };
            console.log(`Created buy user ${userOrderInfo.userId}`);

            // Step 6b: Fund their wallet
            await apiRequest(
              "POST",
              "/transaction/addMoneyToWallet",
              { amount: config.userFundingAmount },
              withAuth(user.token),
              true
            );
            console.log(`Funded wallet for user ${userOrderInfo.userId}`);

            // We'll measure response time just for the buy order
            const buyStartTime = Date.now();

            // Step 6c: Perform buy order
            const buyOrderPayload = {
              stock_id: userOrderInfo.stockId,
              is_buy: true,
              order_type: "MARKET",
              quantity: userOrderInfo.quantity,
            };

            const response = await apiRequest(
              "POST",
              "/engine/placeStockOrder",
              buyOrderPayload,
              withAuth(user.token)
            );

            const buyEndTime = Date.now();
            const responseTime = buyEndTime - buyStartTime;

            // Update statistics
            responseTimes.push(responseTime);
            minResponseTime = Math.min(minResponseTime, responseTime);
            maxResponseTime = Math.max(maxResponseTime, responseTime);
            totalResponseTime += responseTime;

            successfulOrders++;

            // Step 6d: Wait for transaction processing
            await delay(config.verificationDelay);

            const checkTime = Date.now();
            const waitTimeBeforeCheck = checkTime - buyEndTime;

            // Step 6e: Get user's stock transactions
            const txResponse = await apiRequest(
              "GET",
              "/transaction/getStockTransactions",
              undefined,
              withAuth(user.token)
            );

            // Step 6f: Check if there exists a completed MARKET transaction
            let transactionCompleted = false;
            if (txResponse.success && Array.isArray(txResponse.data)) {
              const completedTx = txResponse.data.find(
                (tx: any) =>
                  tx.stock_id === userOrderInfo.stockId &&
                  tx.order_type === "MARKET" &&
                  tx.is_buy === true &&
                  tx.quantity === userOrderInfo.quantity &&
                  tx.order_status === "COMPLETED"
              );

              if (completedTx) {
                transactionCompleted = true;
                completedMarketTransactions++;
                console.log(`User ${userOrderInfo.userId} has a completed market transaction`);
              } else {
                console.log(
                  `User ${userOrderInfo.userId} market transaction status is ${txResponse.data[0]?.order_status}  ${waitTimeBeforeCheck}ms after order init`
                );
              }
            }

            return {
              user: userOrderInfo.userId,
              stockId: userOrderInfo.stockId,
              quantity: userOrderInfo.quantity,
              responseTime,
              status: "success",
              txId: response.data?.stock_tx_id,
              transactionCompleted,
            };
          } catch (error) {
            // Still track response time for failed requests if possible
            const endTime = Date.now();
            const responseTime = endTime - Date.now(); // This might be negative if error occurred before buy

            if (responseTime > 0) {
              responseTimes.push(responseTime);
              minResponseTime = Math.min(minResponseTime, responseTime);
              maxResponseTime = Math.max(maxResponseTime, responseTime);
              totalResponseTime += responseTime;
            }

            failedOrders++;

            return {
              user: userOrderInfo.userId,
              stockId: userOrderInfo.stockId,
              quantity: userOrderInfo.quantity,
              responseTime: responseTime > 0 ? responseTime : null,
              status: "failed",
              error: error.message || "Unknown error",
              transactionCompleted: false,
            };
          }
        })()
      );
    }

    // Step 9: Execute all buy orders concurrently
    console.log(`Beginning to execute ${buyPromises.length} buy processes concurrently...`);
    console.time("BuyOrdersTime");

    // Wait for all buy processes to complete
    const buyResults = await Promise.all(buyPromises);

    console.timeEnd("BuyOrdersTime");

    // Calculate statistics (only if we have valid response times)
    const validResponseTimes = responseTimes.filter((t) => t > 0);
    const averageResponseTime =
      validResponseTimes.length > 0
        ? validResponseTimes.reduce((sum, time) => sum + time, 0) / validResponseTimes.length
        : 0;

    // Print results
    console.log("\n=== BUY ORDERS SUMMARY ===");
    console.log(`Total orders: ${config.numberOfBuyUsers}`);
    console.log(`Successful orders: ${successfulOrders}`);
    console.log(`Failed orders: ${failedOrders}`);
    console.log(`Failure rate: ${((failedOrders / config.numberOfBuyUsers) * 100).toFixed(2)}%`);
    console.log(
      `Completed market transactions: ${completedMarketTransactions} out of ${
        config.numberOfBuyUsers
      } (${((completedMarketTransactions / config.numberOfBuyUsers) * 100).toFixed(2)}%)`
    );

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

    console.log("\nTrading simulation completed successfully");
    console.timeEnd("TotalSimulationTime");
  } catch (error) {
    console.error("Error in trading simulation:", error);
  }
}

// Run the simulation
runTradingSimulation();

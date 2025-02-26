import { apiRequest, createUniqueUser, withAuth } from "./utils";

// Configuration
const config = {
  numberOfUsers: 100,
  userBatchSize: 100,
  numberOfStocks: 100,
  numberOfTransactions: 150000 * 3,
  maxQuantity: 1000,
  minPrice: 0.1,
  maxPrice: 500,
  concurrencyBatch: 15000, // Number of concurrent requests
  delayBetweenBatches: 100, // milliseconds between batches
};

// Helper functions
function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBoolean(): boolean {
  return Math.random() >= 0.5;
}

function getRandomUser(users: any[]): any {
  return users[Math.floor(Math.random() * users.length)];
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Function to create a random order payload
function createRandomOrderPayload(stocks: string[], users: any[]) {
  const isBuy = getRandomBoolean();
  const user = getRandomUser(users);
  const stockId = stocks[Math.floor(Math.random() * stocks.length)];
  const quantity = getRandomInt(1, config.maxQuantity);
  const orderType = isBuy ? "MARKET" : "LIMIT";

  const orderPayload: any = {
    stock_id: stockId,
    is_buy: isBuy,
    order_type: orderType,
    quantity: quantity,
  };

  // Add limit price if it's a limit order
  if (orderType === "LIMIT") {
    orderPayload.price = getRandomInt(config.minPrice, config.maxPrice);
  }

  return { orderPayload, userToken: user.token, isBuy, userId: user.id };
}

// Main execution function
async function runTradingSimulation() {
  try {
    console.log(`Starting concurrent trading simulation with ${config.numberOfUsers} users...`);
    console.time("TotalSimulationTime");

    // Create multiple users in batches
    console.log(`Creating ${config.numberOfUsers} users in batches of ${config.userBatchSize}...`);
    const users: any[] = [];

    for (let i = 0; i < config.numberOfUsers; i += config.userBatchSize) {
      const batchEnd = Math.min(i + config.userBatchSize, config.numberOfUsers);
      const batchPromises: Promise<any>[] = [];

      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(
          (async () => {
            const userResult = await createUniqueUser();
            return {
              id: j + 1,
              token: userResult.token,
              ...userResult.user,
            };
          })()
        );
      }

      const batchResults = await Promise.all(batchPromises);
      users.push(...batchResults);

      console.log(`Created users ${i + 1} to ${batchEnd} (batch of ${batchEnd - i})`);
      await delay(config.delayBetweenBatches);
    }

    console.log("All users created successfully");

    // Fund all users' wallets with sufficient amount in batches
    console.log("Funding user wallets in batches...");
    for (let i = 0; i < users.length; i += config.userBatchSize) {
      const batchEnd = Math.min(i + config.userBatchSize, users.length);
      const batchPromises: Promise<any>[] = [];

      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(
          apiRequest(
            "POST",
            "/transaction/addMoneyToWallet",
            { amount: 10000000000 }, // Large funding for transactions
            withAuth(users[j].token),
            true
          )
        );
      }

      await Promise.all(batchPromises);
      console.log(`Funded wallets for users ${i + 1} to ${batchEnd}`);
      await delay(config.delayBetweenBatches);
    }

    console.log("Funded all user wallets successfully");

    // Create stock objects and store their IDs
    const stocks: string[] = [];
    console.log(`Creating ${config.numberOfStocks} stocks...`);

    // Create stocks in parallel batches
    const stockBatchSize = 100;
    for (let i = 0; i < config.numberOfStocks; i += stockBatchSize) {
      const batchPromises: any[] = [];
      const batchEnd = Math.min(i + stockBatchSize, config.numberOfStocks);

      for (let j = i; j < batchEnd; j++) {
        batchPromises.push(
          (async () => {
            // Choose a random user to create each stock
            const creatorUser = getRandomUser(users);

            const stockResponse = await apiRequest(
              "POST",
              "/setup/createStock",
              { stock_name: `Stock ${j + 1}-${Date.now()}` },
              withAuth(creatorUser.token),
              true
            );

            const stockId: string = stockResponse.data.stock_id;
            stocks.push(stockId);

            // Add stock to all users' portfolios (with varying quantities)
            const addStockPromises: Promise<any>[] = [];
            for (const user of users) {
              const quantity = getRandomInt(1000000, 10000000);
              addStockPromises.push(
                apiRequest(
                  "POST",
                  "/setup/addStockToUser",
                  { stock_id: stockId, quantity },
                  withAuth(user.token),
                  true
                )
              );
            }

            await Promise.all(addStockPromises);
            return stockId;
          })()
        );
      }

      await Promise.all(batchPromises);
      console.log(
        `Created ${Math.min(i + stockBatchSize, config.numberOfStocks)}/${
          config.numberOfStocks
        } stocks`
      );
      await delay(config.delayBetweenBatches);
    }

    console.log("All stocks created and distributed to users successfully");
    console.log(`Beginning to place ${config.numberOfTransactions} random orders concurrently...`);
    console.time("TransactionsTime");

    // Track completed transactions
    let completedTransactions = 0;
    let cancelledTransactions = 0;

    // Track transactions per user
    const userTransactionCounts: Record<number, number> = {};
    users.forEach((user) => (userTransactionCounts[user.id] = 0));

    // Process transactions in batches for better concurrency control
    for (let i = 0; i < config.numberOfTransactions; i += config.concurrencyBatch) {
      const batchPromises: any[] = [];
      const batchEnd = Math.min(i + config.concurrencyBatch, config.numberOfTransactions);

      // Create a batch of concurrent requests
      for (let j = i; j < batchEnd; j++) {
        const { orderPayload, userToken, isBuy, userId } = createRandomOrderPayload(stocks, users);

        // Each transaction is its own async process that may include both order placement and cancellation
        batchPromises.push(
          (async () => {
            try {
              // Place the order
              const response = await apiRequest(
                "POST",
                "/engine/placeStockOrder",
                orderPayload,
                withAuth(userToken)
              );

              userTransactionCounts[userId]++;

              // If it's a sell order, immediately check if we should cancel it (50% chance)
              if (
                !isBuy &&
                response &&
                response.data &&
                response.data.stock_tx_id &&
                getRandomBoolean()
              ) {
                try {
                  // Send cancel request right away
                  const cancelPayload = { stock_tx_id: response.data.stock_tx_id };
                  await apiRequest(
                    "POST",
                    "/engine/cancelStockTransaction",
                    cancelPayload,
                    withAuth(userToken)
                  );
                  cancelledTransactions++;
                } catch (cancelError) {
                  console.error(
                    `Error cancelling transaction ${response.data.stock_tx_id}:`,
                    cancelError
                  );
                }
              }

              return response;
            } catch (error) {
              console.error(`Error in transaction ${j}:`, error);
              return null; // Continue despite errors
            }
          })()
        );
      }

      // Wait for all requests in the batch to complete (which may include both orders and cancellations)
      await Promise.all(batchPromises);

      completedTransactions += batchEnd - i;
      console.log(
        `Completed ${completedTransactions}/${config.numberOfTransactions} transactions, Cancelled ${cancelledTransactions} sell orders`
      );

      // Small delay between batches to prevent overwhelming the server
      await delay(config.delayBetweenBatches);
    }

    console.log(`Total sell orders cancelled: ${cancelledTransactions}`);
    console.log("Transactions per user:");

    // Display transactions for each user (summarized for large numbers of users)
    if (users.length <= 20) {
      users.forEach((user) => {
        console.log(
          `User ${user.id} (${user.username}): ${userTransactionCounts[user.id]} transactions`
        );
      });
    } else {
      console.log(`User transaction summary for ${users.length} users:`);
      let totalTransactions = 0;
      let maxTransactions = 0;
      let minTransactions = Number.MAX_SAFE_INTEGER;
      let maxUser: any = null;
      let minUser: any = null;

      users.forEach((user) => {
        const count = userTransactionCounts[user.id];
        totalTransactions += count;

        if (count > maxTransactions) {
          maxTransactions = count;
          maxUser = user;
        }

        if (count < minTransactions) {
          minTransactions = count;
          minUser = user;
        }
      });

      const avgTransactions = totalTransactions / users.length;
      console.log(`Average transactions per user: ${avgTransactions.toFixed(2)}`);
      console.log(
        `User with most transactions: User ${maxUser?.id} (${maxUser?.user_name}) with ${maxTransactions} transactions`
      );
      console.log(
        `User with least transactions: User ${minUser?.id} (${minUser?.user_name}) with ${minTransactions} transactions`
      );
    }

    console.timeEnd("TransactionsTime");
    console.log("Trading simulation completed successfully");
    console.timeEnd("TotalSimulationTime");
  } catch (error) {
    console.error("Error in trading simulation:", error);
  }
}

// Run the simulation
runTradingSimulation();

import { createClient } from 'redis';
import {Schema} from 'redis-om';

const redisClient = createClient({
  url: 'redis://localhost:6379', // Default Redis URL
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');
  } catch (error) {
    console.error('Could not connect to Redis:', error);
  }
};

export { redisClient, connectRedis };


// All of the above code was generated with CHAT GPT.

const stockSchema = new Schema('stocks', {
  stock_id: { type: 'string' }, // We need a id for our stocks.
  stock_name: { type: 'string' }, // We could also simply use the stock_name itself as the id
  // current_price: { type: 'number'}, // Not required, as this should be inferred from the matching engine.
  // current_quantity: { type: 'number'} // Not required, as this should be inferred from the matching engine.
});

// Contains duplicate info found in stocks, not sure if want to keep it this way
// in the context of speeding up querys
const stockOwnedSchema = new Schema('owned_stocks', {
  stock_id: { type: 'string' }, 
  stock_name: { type: 'string' },
  current_quantity: { type: 'number'}
});

const WalletTransactionSchmea = new Schema('wallet_transactions', {
  wallet_tx_id: { type: 'string' },
  stock_tx_id: { type: 'string'},
  is_debit: { type: 'boolean' },
  quantity: { type: 'number'},
  time_stamp: { type: 'date'}
});

const StockTransactionSchmea = new Schema('stock_transactions', {
  stock_tx_id: { type: 'string' },
  stock_id: { type: 'string'},
  wallet_tx_id: { type: 'string' },
  order_status: { type: 'string' },
  is_buy: { type: 'boolean' },
  order_type: { type: 'string' },
  stock_price: { type: 'number'},
  quantity: { type: 'number'},
  parent_tx_id: { type: 'string' },
  time_stamp: { type: 'date'}
});

const userSchema = new Schema('users', {
  user_name: { type: 'string' }, // These are unique, could replace with user_id if needed
  password: { type: 'string'},
  name: { type: 'string'},
  portfolio: { type: 'string[]'}, // Should contain stock ID and quantity owned
  transaction_history: { type: 'string[]'},
  wallet_balence: { type: 'number'}
});
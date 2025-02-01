import { redisConnection, setupRedisConnection } from "./userApiService";

const stockService = {
  async createStock(stock_name: string) {
    if (!redisConnection) {
      setupRedisConnection();
    }
    // TODO: Do I need to explicitly check if stock_name is available or is there a unique constraint?
    // const stock = stockRepository.createEntity({
    //   stock_name,
    // });
    // const stock_id = await stockRepository.save(stock);
    const stock_id = "1";
    return stock_id;
  },
};

export default stockService;

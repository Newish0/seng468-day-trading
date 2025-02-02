export type LimitSellOrderRequest = {
    stock_id: string;
    quantity: number;
    price: number;
    stock_tx_id: string;
    user_name: string;
};

export type MarketBuyRequest = {
    stock_id: string;
    quantity: number;
    stock_tx_id: string;
    budget: number;
    user_name: string;
};

export type CancelSellRequest = {
    stock_id: string;
    quantity: number;
    price: number;
    stock_tx_id: string;
};


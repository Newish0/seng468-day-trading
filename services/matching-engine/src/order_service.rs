use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderUpdate {
    pub stock_id: String,
    pub sold_quantity: u32,
    pub remaining_quantity: u32,
    pub price: f64,
    pub stock_tx_id: String,
    pub user_name: String,
}

#[derive(Debug)]
pub struct OrderServiceConfig {
    pub base_url: String,
    pub max_retries: u32,
    pub base_retry_delay_secs: u64,
}

#[derive(Debug)]
pub struct OrderService {
    client: Client,
    config: OrderServiceConfig,
}

impl OrderService {
    pub fn new(config: OrderServiceConfig) -> Self {
        Self {
            client: Client::new(),
            config,
        }
    }

    async fn make_request(
        &self,
        endpoint: &str,
        update: &OrderUpdate,
    ) -> Result<(), Box<dyn Error>> {
        let url = format!("{}/{}", self.config.base_url, endpoint);
        let mut retries = 0;

        loop {
            let result = self.client.post(&url).json(update).send().await;

            match result {
                Ok(response) if response.status().is_success() => {
                    return Ok(());
                }
                Ok(response) => {
                    let error_msg = response.text().await?;
                    if retries >= self.config.max_retries {
                        return Err(format!(
                            "Request failed after {} retries: {}",
                            retries, error_msg
                        )
                        .into());
                    }
                }
                Err(e) => {
                    if retries >= self.config.max_retries {
                        return Err(
                            format!("Request failed after {} retries: {}", retries, e).into()
                        );
                    }
                }
            }

            retries += 1;
            let retry_delay = self.config.base_retry_delay_secs.pow(retries);
            sleep(Duration::from_secs(retry_delay)).await;
        }
    }

    /// Sends a sale update to the Order Service
    ///
    /// # Arguments
    /// * `update` - The OrderUpdate containing sale information
    pub async fn update_sale(&self, update: OrderUpdate) -> Result<(), Box<dyn Error>> {
        self.make_request("updateSale", &update).await
    }
}

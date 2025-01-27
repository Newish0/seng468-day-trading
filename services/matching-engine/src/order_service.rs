use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::error::Error;
use tokio::time::{sleep, Duration};

#[derive(Debug, Serialize, Deserialize)]
pub struct OrderUpdate {
    stock_id: String,
    quantity: f64,
    price: f64,
    stock_tx_id: String,
}

#[derive(Debug)]
pub struct OrderServiceConfig {
    base_url: String,
    max_retries: u32,
    retry_delay_secs: u64,
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
            sleep(Duration::from_secs(self.config.retry_delay_secs)).await;
        }
    }

    /// Sends a partial sell update to the Order Service
    ///
    /// # Arguments
    /// * `update` - The OrderUpdate containing partial sell information
    pub async fn partial_sell(&self, update: OrderUpdate) -> Result<(), Box<dyn Error>> {
        self.make_request("partialSell", &update).await
    }

    /// Sends a complete sell update to the Order Service
    ///
    /// # Arguments
    /// * `update` - The OrderUpdate containing complete sell information
    pub async fn complete_sell(&self, update: OrderUpdate) -> Result<(), Box<dyn Error>> {
        self.make_request("completeSell", &update).await
    }
}

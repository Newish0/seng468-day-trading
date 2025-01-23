<script lang="ts">
  import "simpledotcss";
  import StockPortfolio from "./lib/StockPortfolio/StockPortfolio.svelte";
  import Stocks from "./lib/Stocks/Stocks.svelte";
  import Wallet from "./lib/Wallet/Wallet.svelte";
  import StockTransactions from "./lib/StockTransactions/StockTransactions.svelte";
  import WalletTransactions from "./lib/WalletTransactions/WalletTransactions.svelte";
</script>

<main class="container">
  <h1>TradeSimple</h1>

  <Wallet />
  <WalletTransactions />
  <StockPortfolio />
  <StockTransactions />
  <Stocks />
</main>

<style>
  main {
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    margin: 100px auto;
  }
</style>

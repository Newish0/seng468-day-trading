<script lang="ts">
  import Auth from "./lib/Auth/Auth.svelte";
  import "simpledotcss";
  import "./app.css";
  import StockPortfolio from "./lib/StockPortfolio/StockPortfolio.svelte";
  import Stocks from "./lib/Stocks/Stocks.svelte";
  import Wallet from "./lib/Wallet/Wallet.svelte";
  import StockTransactions from "./lib/StockTransactions/StockTransactions.svelte";
  import WalletTransactions from "./lib/WalletTransactions/WalletTransactions.svelte";

  let loggedIn = true;
</script>

<main class="container">
  <div class="pb-10">
    <h1>TradeSimple</h1>
  </div>

  {#if !loggedIn}
    <Auth />
  {:else}
    <Wallet />
    <WalletTransactions />
    <StockPortfolio />
    <StockTransactions />
    <Stocks />
  {/if}
</main>

<style>
  main {
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    margin: 100px auto;
  }
</style>

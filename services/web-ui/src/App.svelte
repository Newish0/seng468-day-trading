<script lang="ts">
  import "simpledotcss";
  import "./app.css";
  import Auth from "./lib/Auth/Auth.svelte";
  import StockPortfolio from "./lib/StockPortfolio/StockPortfolio.svelte";
  import Stocks from "./lib/Stocks/Stocks.svelte";
  import StockTransactions from "./lib/StockTransactions/StockTransactions.svelte";
  import Toast from "./lib/Toast/Toast.svelte";
  import Wallet from "./lib/Wallet/Wallet.svelte";
  import WalletTransactions from "./lib/WalletTransactions/WalletTransactions.svelte";
  import ThemeToggle from "./lib/ThemeToggle/ThemeToggle.svelte";
  import { auth } from "./lib/Auth/auth";
  import LogOut from "./lib/Auth/LogOut.svelte";
</script>

<main class="max-w-[1200px] flex flex-col my-[60px] mx-auto gap-12">
  <div class="pb-4 flex justify-between">
    <h1 class="font-bold text-3xl">TradeSimple</h1>
    <div class="text-right font-mono">
      <p>UVic SENG468</p>
      <p>Spring 2025</p>
    </div>
  </div>

  {#if !$auth.token}
    <Auth />
  {:else}
    <Wallet />
    <WalletTransactions />
    <StockPortfolio />
    <StockTransactions />
    <Stocks />
  {/if}
  <Toast />

  <div class="absolute top-2 right-2 !flex !items-center !gap-2">
    <ThemeToggle />
    {#if $auth.token}
      <LogOut />
    {/if}
  </div>
</main>

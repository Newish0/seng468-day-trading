<script lang="ts">
  import { onMount } from "svelte";

  let balance: number;

  onMount(() => {
    balance = getBalance();
  });

  const getBalance = (): number => {
    return 12345;
  };

  const handleAddMoney = () => {
    // to be implemented
  };
</script>

<div class="flex flex-col w-full">
  <h3>Wallet</h3>

  {#if !balance}
    Loading...
  {:else}
    <div class="flex justify-between items-center">
      <p>Balance: ${balance}</p>
      <button on:click={handleAddMoney}>Add money</button>
    </div>
  {/if}
</div>

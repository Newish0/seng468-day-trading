<script lang="ts">
  import AddMoneyModal from "./../AddMoneyModal/AddMoneyModal.svelte";
  import { onMount } from "svelte";

  let balance: number;

  onMount(() => {
    balance = getBalance();
  });

  const getBalance = (): number => {
    // to be implemented

    return 12345;
  };
</script>

<div class="flex flex-col w-full max-w-md gap-3">
  <h3>Wallet</h3>

  {#if !balance}
    Loading...
  {:else}
    <div class="flex items-center gap-10">
      <p class="text-2xl">Balance: ${balance}</p>

      <AddMoneyModal />
    </div>
  {/if}
</div>

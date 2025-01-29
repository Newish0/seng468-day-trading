<script lang="ts">
  import { onMount } from "svelte";

  let balance: number;

  onMount(() => {
    balance = getBalance();
  });

  const getBalance = (): number => {
    // to be implemented

    return 12345;
  };

  const handleAddMoney = () => {
    // to be implemented
  };
</script>

<div class="flex flex-col w-full max-w-md gap-3">
  <h3>Wallet</h3>

  {#if !balance}
    Loading...
  {:else}
    <div class="flex items-center gap-10">
      <p class="text-2xl">Balance: ${balance}</p>
      <!-- svelte-ignore a11y_click_events_have_key_events -->
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <!-- svelte-ignore a11y_missing_attribute -->
      <a class="font-medium cursor-pointer" on:click={handleAddMoney}
        >Add money</a
      >
    </div>
  {/if}
</div>

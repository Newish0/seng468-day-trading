<script lang="ts">
  import type { GetWalletBalanceRequest, GetWalletBalanceResponse } from "shared-types/dtos/user-api/transaction/getWalletBalance";
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { onMount } from "svelte";
  import AddMoneyModal from "./../AddMoneyModal/AddMoneyModal.svelte";

  let balance: number;

  onMount(() => {
    getBalance().then((data) => {
      balance = data;
    });
  });

  const getBalance = async () => {
    const response = await makeInternalRequest<GetWalletBalanceRequest, GetWalletBalanceResponse>({
      body: undefined
    })("userApi", "getWalletBalance");

    if (!response.success) {
      // TODO: Raise some kind of error toast to the user
      return 0;
    }

    return response.data.data.balance;
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

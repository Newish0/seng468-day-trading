<script lang="ts">
  import type {
    GetWalletBalanceRequest,
    GetWalletBalanceResponse,
  } from "shared-types/dtos/user-api/transaction/getWalletBalance";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { onMount } from "svelte";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import AddMoneyModal from "./../AddMoneyModal/AddMoneyModal.svelte";
  import { authHeader } from "../Auth/auth";

  let fetched = false;
  let balance: number;

  onMount(() => {
    getBalance().then((data) => {
      balance = data;
      fetched = true;
    });
  });

  const getBalance = async () => {
    const response = await makeBackendRequest<GetWalletBalanceRequest, GetWalletBalanceResponse>({
      headers: $authHeader,
      body: undefined,
    })("userApi", "getWalletBalance");

    if (!response.success) {
      addToast({ message: "Failed to get wallet balance", type: TOAST_TYPES.ERROR });
      return 0;
    }

    return response.data.balance;
  };
</script>

<div class="flex flex-col w-full max-w-md gap-3">
  <h3>Wallet</h3>

  {#if !fetched}
    Loading...
  {:else}
    <div class="flex items-center gap-10">
      <p class="text-2xl">Balance: ${balance}</p>

      <AddMoneyModal />
    </div>
  {/if}
</div>

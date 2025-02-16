<script lang="ts">
  import {
    type AddMoneyToWalletRequest,
    type AddMoneyToWalletResponse,
  } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { authHeader } from "../Auth/auth";
  import { makeBackendRequest } from "../utils/makeBackendRequest";

  let modal: HTMLDialogElement;
  let amount: number = 0;
  let loading = false;

  const open = () => {
    modal.showModal();
  };

  const handleAddMoney = async () => {
    loading = true;
    const response = await makeBackendRequest<AddMoneyToWalletRequest, AddMoneyToWalletResponse>({
      headers: $authHeader,
      body: {
        amount,
      },
    })("userApi", "addMoneyToWallet");

    if (!response.success) {
      addToast({ message: `Failed to add $${amount} to wallet`, type: TOAST_TYPES.ERROR });
      loading = false;
      return;
    }

    amount = 0;
    loading = false;
    modal.close();
    window.location.reload();
  };
</script>

<button class="ghost font-medium cursor-pointer" on:click={open}>Add money</button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>Add money to wallet</h3>

    <div class="flex flex-col w-max">
      <label>
        Amount
        <br />
        <input type="number" min="0" bind:value={amount} />
      </label>
    </div>

    <div class="flex self-end gap-1">
      {#if !loading}
        <button class="ghost" on:click={() => modal.close()}>Cancel</button>
      {/if}
      <button on:click={handleAddMoney} disabled={loading}>
        {#if loading}
          Adding money...
        {:else}
          Add money
        {/if}
      </button>
    </div>
  </div>
</dialog>

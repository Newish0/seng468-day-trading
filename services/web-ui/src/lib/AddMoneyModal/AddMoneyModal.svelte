<script lang="ts">
  import { type AddMoneyToWalletRequest, type AddMoneyToWalletResponse } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";

  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleAddMoney = async () => {
    const response = await makeInternalRequest<AddMoneyToWalletRequest, AddMoneyToWalletResponse>({
      body: {
        amount: 0, // TODO: Get this from the input field
      },
    })("userApi", "addMoneyToWallet");

    if (!response.success) {
      addToast({ message: "Failed to add money to wallet", type: TOAST_TYPES.ERROR });
      return;
    }

    // TODO: Show the amount added in the toast
    addToast({ message: "Successfully added money to wallet", type: TOAST_TYPES.SUCCESS });
  };
</script>

<button class="ghost font-medium cursor-pointer" on:click={open}
  >Add money</button
>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>Add money to wallet</h3>

    <div class="flex flex-col w-max">
      <label>
        Amount
        <br />
        <input type="number" />
      </label>
    </div>

    <form method="dialog" class="self-end">
      <button class="ghost">Cancel</button>
      <button on:click={handleAddMoney}>Add money</button>
    </form>
  </div>
</dialog>

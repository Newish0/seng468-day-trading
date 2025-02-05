<script lang="ts">
  import { type AddMoneyToWalletRequest, type AddMoneyToWalletResponse } from "shared-types/dtos/user-api/transaction/addMoneyToWallet";
  import { makeInternalRequest } from "shared-utils/internalCommunication";

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
      // TODO: Raise some kind of error toast to the user
      return;
    }

    // TODO: Show some kind of success toast to the user and update UI
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

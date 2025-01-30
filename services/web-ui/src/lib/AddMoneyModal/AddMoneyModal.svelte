<script lang="ts">
  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleAddMoney = () => {
    // to be implemented
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
      <button class="ghost">Close</button>
      <button on:click={handleAddMoney}>Add money</button>
    </form>
  </div>
</dialog>

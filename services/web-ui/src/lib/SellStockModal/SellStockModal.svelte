<script lang="ts">
  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleAddMoney = () => {
    // to be implemented
  };

  export let stockName;
</script>

<button class="font-medium cursor-pointer" on:click={open}> Sell stock </button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>
      Sell stock -
      <span class="font-mono">
        {stockName}
      </span>
    </h3>

    <div class="flex flex-col w-max">
      <label>
        Quantity
        <br />
        <input step="1" type="number" />
      </label>
    </div>

    <form method="dialog" class="self-end">
      <button class="ghost">Cancel</button>
      <button on:click={handleAddMoney}>Place sell order</button>
    </form>
  </div>
</dialog>

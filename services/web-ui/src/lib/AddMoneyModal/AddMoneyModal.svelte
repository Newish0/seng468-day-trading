<script lang="ts">
  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleAddMoney = () => {
    // to be implemented
  };
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<a class="font-medium cursor-pointer" on:click={open}>Add money</a>

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
      <button>Close</button>
      <button on:click={handleAddMoney}>Add money</button>
    </form>
  </div>
</dialog>

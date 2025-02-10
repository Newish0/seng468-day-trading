<script lang="ts">
  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  export let confirmLabel: string = "Confirm";
  export let message: string = "Are you sure?";
</script>

<button class="font-medium cursor-pointer" on:click={open}>
  <slot>Button</slot>
</button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>{message}</h3>

    <p>This action cannot be undone.</p>

    <form method="dialog" class="self-end">
      <button class="ghost">Back</button>
      <button on:click>{confirmLabel}</button>
    </form>
  </div>
</dialog>

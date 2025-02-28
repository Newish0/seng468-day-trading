<script lang="ts">
  import type {
    PlaceStockOrderRequest,
    PlaceStockOrderResponse,
  } from "shared-types/dtos/user-api/engine/placeStockOrder";
  import { ORDER_TYPE } from "shared-types/transactions";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { authHeader } from "../Auth/auth";

  export let stockId: string;
  export let stockName: string;

  let modal: HTMLDialogElement;
  let quantity: number = 0;
  let loading = false;

  const open = () => {
    modal.showModal();
  };

  const handleBuyStock = async () => {
    loading = true;
    const response = await makeBackendRequest<PlaceStockOrderRequest, PlaceStockOrderResponse>({
      headers: $authHeader,
      body: {
        stock_id: stockId,
        quantity,
        order_type: ORDER_TYPE.MARKET,
        price: 0,
        is_buy: true,
      },
    })("userApi", "placeStockOrder");

    if (!response.success) {
      addToast({ message: "Failed to buy stock", type: TOAST_TYPES.ERROR });
      loading = false;
      return;
    }

    quantity = 0;
    loading = false;
    modal.close();
    window.location.reload();
  };
</script>

<button class="font-medium cursor-pointer" on:click={open}> Buy stock </button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>Buy stock</h3>

    <div class="flex flex-col w-max">
      <label>
        Quantity
        <br />
        <input step="1" type="number" min="0" bind:value={quantity} />
      </label>
    </div>

    <div class="flex self-end gap-1">
      {#if !loading}
        <button class="ghost" on:click={() => modal.close()}>Cancel</button>
      {/if}
      <button on:click={handleBuyStock} disabled={loading}>
        {#if loading}
          Buying stock...
        {:else}
          Buy stock
        {/if}
      </button>
    </div>
  </div>
</dialog>

<script lang="ts">
  import {
    type PlaceStockOrderRequest,
    type PlaceStockOrderResponse,
  } from "shared-types/dtos/user-api/engine/placeStockOrder";
  import { ORDER_TYPE } from "shared-types/transactions";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { authHeader } from "../Auth/auth";

  export let stockId: string;
  export let stockName: string;

  let modal: HTMLDialogElement;
  let quantity: number = 0;
  let price: number = 0;
  let loading: boolean = false;

  const open = () => {
    modal.showModal();
  };

  const handleSellStock = async () => {
    loading = true;
    const response = await makeBackendRequest<PlaceStockOrderRequest, PlaceStockOrderResponse>({
      headers: $authHeader,
      body: {
        stock_id: stockId,
        quantity,
        order_type: ORDER_TYPE.LIMIT,
        price,
        is_buy: false,
      },
    })("userApi", "placeStockOrder");

    if (!response.success) {
      addToast({ message: "Failed to sell stock", type: TOAST_TYPES.ERROR });
      loading = false;
      return;
    }

    loading = false;
    modal.close();
    window.location.reload();
  };
</script>

<button class="font-medium cursor-pointer" on:click={open}> Sell stock </button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>Sell stock</h3>

    <div class="flex flex-col w-max">
      <label>
        Quantity
        <br />
        <input step="1" type="number" min="0" bind:value={quantity} />
      </label>
    </div>

    <div class="flex flex-col w-max">
      <label>
        Price
        <br />
        <input type="number" min="0" step="0.01" bind:value={price} />
      </label>
    </div>

    <div class="flex self-end gap-1">
      {#if !loading}
        <button class="ghost" on:click={() => modal.close()}>Cancel</button>
      {/if}
      <button on:click={handleSellStock} disabled={loading}>
        {#if loading}
          Placing order...
        {:else}
          Place sell order
        {/if}
      </button>
    </div>
  </div>
</dialog>

<script lang="ts">
  import { type PlaceStockOrderRequest, type PlaceStockOrderResponse } from "shared-types/dtos/user-api/engine/placeStockOrder";
  import { ORDER_TYPE } from "shared-types/transactions";
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";

  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleSellStock = async () => {
    const response = await makeInternalRequest<PlaceStockOrderRequest, PlaceStockOrderResponse>({
      body: {
        stock_id: stockId,
        quantity: 0, // TODO: Get this from the input field
        order_type: ORDER_TYPE.LIMIT,
        price: 0, // TODO: Get this from the input field
        is_buy: false,
      },
    })("userApi", "placeStockOrder");

    if (!response.success) {
      addToast({ message: "Failed to sell stock", type: TOAST_TYPES.ERROR });
      return;
    }

    // TODO: Change message to `Successfully placed ${quantity} shares of ${stockName} for sale for $${price}`
    addToast({ message: "Successfully sold stock", type: TOAST_TYPES.SUCCESS });
  };

  export let stockId: string;
  export let stockName: string;
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
      <button on:click={handleSellStock}>Place sell order</button>
    </form>
  </div>
</dialog>

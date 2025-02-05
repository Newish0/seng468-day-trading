<script lang="ts">
  import type { PlaceStockOrderRequest, PlaceStockOrderResponse } from "shared-types/dtos/user-api/engine/placeStockOrder";
  import { ORDER_TYPE } from "shared-types/transactions";
  import { makeInternalRequest } from "shared-utils/internalCommunication";

  let modal: HTMLDialogElement;

  const open = () => {
    modal.showModal();
  };

  const handleBuyStock = async () => {
    const response = await makeInternalRequest<PlaceStockOrderRequest, PlaceStockOrderResponse>({
      body: {
        stock_id: stockId,
        quantity: 0, // TODO: Get this from the input field
        order_type: ORDER_TYPE.MARKET,
        price: 0, // TODO: I don't think this is needed but for typesafety it is included
        is_buy: true,
      },
    })("userApi", "placeStockOrder");

    if (!response.success) {
      // TODO: Raise some kind of error toast to the user
      return;
    }

    // TODO: Show some kind of success toast to the user
  };

  export let stockId: string;
  export let stockName: string;
</script>

<button class="font-medium cursor-pointer" on:click={open}> Buy stock </button>

<dialog bind:this={modal}>
  <div class="flex flex-col gap-4">
    <h3>
      Buy stock -
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
      <button on:click={handleBuyStock}>Confirm purchase</button>
    </form>
  </div>
</dialog>

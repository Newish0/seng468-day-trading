<script lang="ts">
  import { type GetStockPricesRequest, type GetStockPricesResponse } from "shared-types/dtos/user-api/transaction/getStockPrices";
  import type { AvailableStock } from "shared-types/stocks";
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { onMount } from "svelte";
  import BuyStockModal from "./../BuyStockModal/BuyStockModal.svelte";

  let stocks: AvailableStock[];

  const getStocks = async () => {
    const response = await makeInternalRequest<GetStockPricesRequest, GetStockPricesResponse>({
      body: undefined,
    })("userApi", "getStockPrices");

    if (!response.success) {
      // TODO: Raise some kind of error toast to the user
      return [];
    }

    return response.data.data;
  };

  onMount(() => {
    getStocks().then((data) => {
      stocks = data;
    });
  });
</script>

<div class="flex flex-col w-full gap-4">
  <h3>Stocks</h3>

  <table>
    <thead>
      <tr>
        <th>Stock</th>
        <th>Price</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each stocks as stock}
        <tr>
          <td>{stock.stock_id}</td>
          <td>{stock.current_price}</td>
          <td><BuyStockModal stockName={stock.stock_name} stockId={stock.stock_id} /></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

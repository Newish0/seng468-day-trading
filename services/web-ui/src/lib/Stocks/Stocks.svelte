<script lang="ts">
  import {
    type GetStockPricesRequest,
    type GetStockPricesResponse,
  } from "shared-types/dtos/user-api/transaction/getStockPrices";
  import type { AvailableStock } from "shared-types/stocks";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { onMount } from "svelte";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import BuyStockModal from "./../BuyStockModal/BuyStockModal.svelte";
  import { authHeader } from "../Auth/auth";

  let stocks: AvailableStock[];

  const getStocks = async () => {
    const response = await makeBackendRequest<GetStockPricesRequest, GetStockPricesResponse>({
      headers: $authHeader,
      body: undefined,
    })("userApi", "getStockPrices");

    if (!response.success) {
      addToast({ message: "Failed to get stocks", type: TOAST_TYPES.ERROR });
      return [];
    }

    return response.data;
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

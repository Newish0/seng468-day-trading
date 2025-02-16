<script lang="ts">
  import {
    type GetStockPortfolioRequest,
    type GetStockPortfolioResponse,
  } from "shared-types/dtos/user-api/transaction/getStockPortfolio";
  import type { OwnedStock } from "shared-types/stocks";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { onMount } from "svelte";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import SellStockModal from "./../SellStockModal/SellStockModal.svelte";
  import { authHeader } from "../Auth/auth";

  let portfolio: OwnedStock[];

  const getPortfolio = async () => {
    const response = await makeBackendRequest<GetStockPortfolioRequest, GetStockPortfolioResponse>({
      headers: $authHeader,
      body: undefined,
    })("userApi", "getStockPortfolio");

    if (!response.success) {
      addToast({ message: "Failed to get portfolio", type: TOAST_TYPES.ERROR });
      return [];
    }

    return response.data;
  };

  onMount(() => {
    getPortfolio().then((data) => {
      portfolio = data;
    });
  });
</script>

<div class="flex flex-col w-full gap-4">
  <h3>Holdings</h3>

  <table>
    <thead>
      <tr>
        <th>Stock</th>
        <th>Quantity</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each portfolio as stock}
        <tr>
          <td>{stock.stock_id}</td>
          <td>{stock.quantity_owned}</td>
          <td>
            <SellStockModal stockName={stock.stock_name} stockId={stock.stock_id} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

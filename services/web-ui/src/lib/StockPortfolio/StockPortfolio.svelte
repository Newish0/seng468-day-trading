<script lang="ts">
  import SellStockModal from "./../SellStockModal/SellStockModal.svelte";
  import { onMount } from "svelte";

  let portfolio: any;

  const getPortfolio = () => {
    // to be implemented

    return [
      {
        stock: "AAPL",
        quantity: 5,
      },
      {
        stock: "GOOGL",
        quantity: 5,
      },
    ];
  };

  onMount(() => {
    portfolio = getPortfolio();
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
          <td>{stock.stock}</td>
          <td>{stock.quantity}</td>
          <td>
            <SellStockModal stockName={stock.stock} />
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

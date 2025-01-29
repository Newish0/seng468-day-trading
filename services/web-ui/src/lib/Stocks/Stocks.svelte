<script lang="ts">
  import { onMount } from "svelte";

  let stocks: any;

  const getStocks = () => {
    // to be implemented

    return [
      {
        name: "AAPL",
        price: 5,
      },
      {
        name: "GOOGL",
        price: 5,
      },
    ];
  };

  onMount(() => {
    stocks = getStocks();
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
          <td>{stock.name}</td>
          <td>{stock.price}</td>
          <td><button>Buy stock</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

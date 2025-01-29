<script lang="ts">
  import { onMount } from "svelte";

  let stocks: any;

  const getStocks = () => {
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
    stocks = getStocks();
  });
</script>

<div class="flex flex-col w-full">
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
      {#each stocks as transaction}
        <tr>
          <td>{transaction.stock}</td>
          <td>{transaction.quantity}</td>
          <td><button>Sell stock</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

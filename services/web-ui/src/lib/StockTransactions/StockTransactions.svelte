<script lang="ts">
  import { onMount } from "svelte";

  let transactions: any;

  const getWalletTransactions = () => {
    // to be implemented

    return [
      {
        stock: "AAPL",
        orderType: "Market buy",
        amount: 1500,
        time: "2024-01-29 12:00",
        status: "Pending",
      },
      {
        stock: "GOOGL",
        orderType: "Limit sell",
        amount: 1250,
        time: "2024-01-29 13:15",
        status: "Completed",
      },
      {
        stock: "MSFT",
        orderType: "Market buy",
        amount: 1100,
        time: "2024-01-29 14:30",
        status: "Cancel",
      },
    ];
  };

  onMount(() => {
    transactions = getWalletTransactions();
  });
</script>

<div class="flex flex-col w-full">
  <h3>Stock transactions</h3>

  <table>
    <thead>
      <tr>
        <th>Stock</th>
        <th>Order Type</th>
        <th>Amount</th>
        <th>Time</th>
        <th>Status</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      {#each transactions as transaction}
        <tr>
          <td>{transaction.stock}</td>
          <td>{transaction.orderType}</td>
          <td>${transaction.amount}</td>
          <td>{transaction.time}</td>
          <td>{transaction.status}</td>
          <td>
            {#if transaction.status !== "Completed"}
              <button>Cancel</button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

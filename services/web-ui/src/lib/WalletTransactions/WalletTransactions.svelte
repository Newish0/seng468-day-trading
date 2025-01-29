<script lang="ts">
  import { onMount } from "svelte";

  let transactions;

  const getTransactions = () => {
    // to be implemented

    return [
      {
        stock: "AAPL",
        usedDebit: false,
        amount: 1500,
        time: "2024-01-29 12:00",
      },
      {
        stock: "GOOGL",
        usedDebit: true,
        amount: 1250,
        time: "2024-01-29 13:15",
      },
      {
        stock: "MSFT",
        usedDebit: false,
        amount: 1100,
        time: "2024-01-29 14:30",
      },
    ];
  };

  onMount(() => {
    transactions = getTransactions();
  });
</script>

<div class="flex flex-col w-full">
  <h3>Wallet transactions</h3>

  <table>
    <thead>
      <tr>
        <th>Stock</th>
        <th>Used Debit</th>
        <th>Amount</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      {#each transactions as transaction}
        <tr>
          <td>{transaction.stock}</td>
          <td>{transaction.debit}</td>
          <td>${transaction.amount}</td>
          <td>{transaction.time}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

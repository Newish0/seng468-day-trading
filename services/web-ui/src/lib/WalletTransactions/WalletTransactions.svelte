<script lang="ts">
  import {
    type GetWalletTransactionsRequest,
    type GetWalletTransactionsResponse,
  } from "shared-types/dtos/user-api/transaction/getWalletTransactions";
  import type { WalletTransaction } from "shared-types/transactions";
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { onMount } from "svelte";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { authHeader } from "../Auth/auth";

  let transactions: WalletTransaction[];

  const getWalletTransactions = async () => {
    const response = await makeBackendRequest<
      GetWalletTransactionsRequest,
      GetWalletTransactionsResponse
    >({
      headers: $authHeader,
      body: undefined,
    })("userApi", "getWalletTransactions");

    if (!response.success) {
      addToast({ message: "Failed to get wallet transactions", type: TOAST_TYPES.ERROR });
      return [];
    }

    return response.data;
  };

  onMount(() => {
    getWalletTransactions().then((data) => {
      transactions = data;
    });
  });
</script>

<div class="flex flex-col w-full gap-4">
  <h3>Wallet transactions</h3>

  <table>
    <thead>
      <tr>
        <th>Transaction</th>
        <th>Used Debit</th>
        <th>Amount</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      {#each transactions as transaction, i}
        <tr>
          <!-- TODO: Don't have access to the stock name currently, schema needs to change if we want it -->
          <!-- <td>{transaction.stock}</td> -->
          <td>{i}</td>
          <td>{transaction.is_debit}</td>
          <td>${transaction.amount}</td>
          <td>{transaction.time_stamp}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

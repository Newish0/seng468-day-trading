<script lang="ts">
  import {
    type CancelStockTransactionRequest,
    type CancelStockTransactionResponse,
  } from "shared-types/dtos/user-api/engine/cancelStockTransaction";
  import {
    type GetStockTransactionsRequest,
    type GetStockTransactionsResponse,
  } from "shared-types/dtos/user-api/transaction/getStockTransactions";
  import { ORDER_STATUS, type StockTransaction } from "shared-types/transactions";
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { onMount } from "svelte";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import ConfirmModal from "./../ConfirmModal/ConfirmModal.svelte";
  import { authHeader } from "../Auth/auth";

  let transactions: StockTransaction[];

  const getStockTransactions = async () => {
    const response = await makeInternalRequest<
      GetStockTransactionsRequest,
      GetStockTransactionsResponse
    >({
      headers: $authHeader,
      body: undefined,
    })("userApi", "getStockTransactions");

    if (!response.success) {
      addToast({ message: "Failed to get stock transactions", type: TOAST_TYPES.ERROR });
      return [] as StockTransaction[];
    }

    return response.data.data;
  };

  onMount(() => {
    transactions = []; // No-data value
    getStockTransactions().then((data) => {
      transactions = data;
    });
  });

  const cancelTransaction = async ({ stock_tx_id }: Pick<StockTransaction, "stock_tx_id">) => {
    const response = await makeInternalRequest<
      CancelStockTransactionRequest,
      CancelStockTransactionResponse
    >({
      headers: $authHeader,
      body: {
        stock_tx_id: stock_tx_id,
      },
    })("userApi", "cancelStockTransaction");

    if (!response.success) {
      addToast({ message: "Failed to cancel transaction", type: TOAST_TYPES.ERROR });
      return;
    }

    addToast({ message: "Successfully cancelled transaction", type: TOAST_TYPES.SUCCESS });
    // TODO: Should we refetch at this point or should this be sufficient given we have a success response?
    transactions = transactions.filter((transaction) => transaction.stock_tx_id !== stock_tx_id);
  };
</script>

<div class="flex flex-col w-full gap-4">
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
      <!-- TODO: Partial sell transactions ideally could be grouped together and put under say an accordion -->
      {#each transactions as transaction}
        <tr>
          <td>{transaction.stock_id}</td>
          <td>{transaction.order_type}</td>
          <td>${transaction.stock_price}</td>
          <td>{transaction.time_stamp}</td>
          <td>{transaction.order_status}</td>
          <td>
            {#if transaction.order_status !== ORDER_STATUS.COMPLETED}
              <ConfirmModal
                on:click={() => cancelTransaction({ stock_tx_id: transaction.stock_tx_id })}
                >Cancel</ConfirmModal
              >
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

import { writable } from "svelte/store";

export const walletBalance = writable(0);

export const stockTransactions = writable<any>([]);

export const walletTransactions = writable<any>([]);

export const stocks = writable<any>([]);

export const stockPortfolio = writable<any>([]);

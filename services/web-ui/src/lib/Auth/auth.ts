import { writable } from "svelte/store";

interface AuthStore {
  token: string | null;
  user: string | null;
}

export const auth = writable<AuthStore>({
  // token: localStorage.getItem("jwt") || null,
  token: "some dummy token", // TODO: remove placeholder once auth service merged in
  user: null,
});

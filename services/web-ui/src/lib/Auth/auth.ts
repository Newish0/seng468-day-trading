import { derived, writable } from "svelte/store";

interface AuthStore {
  token: string | null;
  username: string | null;
}

export const auth = writable<AuthStore>({
  // token: localStorage.getItem("jwt") || null,
  // username: null,

  // TODO: remove placeholder once auth service merged in
  token: "some dummy token",
  username: "a-username",
});

type AuthHeader = {
  Authorization: string;
};

export const authHeader = derived(auth, ($auth): AuthHeader | {} => {
  return $auth.token ? { Authorization: `Bearer ${$auth.token}` } : {};
});

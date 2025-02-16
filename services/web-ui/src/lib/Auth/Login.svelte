<script lang="ts">
  import { makeBackendRequest } from "../utils/makeBackendRequest";
  import { auth } from "./auth";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { fade } from "svelte/transition";
  import type { LoginRequest } from "shared-types/dtos/auth/auth";

  export let mode: "login" | "register" = "register";

  let username = "";
  let password = "";

  let loading = false;

  async function login() {
    loading = true;

    const res = await makeBackendRequest<LoginRequest, any>({
      body: { user_name: username, password },
    })("auth", "login");

    if (res.success) {
      const data = res.data;

      localStorage.setItem("jwt", data.token);
      auth.set({ token: data.token, username });
    } else {
      addToast({ message: `Failed to login`, type: TOAST_TYPES.ERROR });
    }
    loading = false;
  }
</script>

<div
  class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4"
  in:fade={{ duration: 200, delay: 50 }}
  out:fade={{ duration: 50 }}
>
  <h3>Login</h3>

  <div class="flex flex-col">
    <label for="username" class="w-max"> Username </label>
    <input type="text" id="username" bind:value={username} />
    <label for="password" class="w-max"> Password </label>
    <input type="password" id="password" bind:value={password} />
  </div>

  <button on:click={login} disabled={loading}>
    {#if loading}
      Logging in...
    {:else}
      Login
    {/if}
  </button>

  <p class="text-base flex items-center">
    New to TradeSimple?
    <button class="ghost" on:click={() => (mode = "register")} disabled={loading}>
      Register instead
    </button>
  </p>
</div>

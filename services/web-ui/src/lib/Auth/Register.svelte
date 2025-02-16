<script lang="ts">
  import type {
    LoginRequest,
    RegisterRequest,
  } from "./../../../../../packages/shared-types/dtos/auth/auth.ts";
  import { makeBackendRequest } from "../utils/makeBackendRequest.js";
  import { auth } from "./auth";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  import { fade } from "svelte/transition";

  export let mode: "login" | "register" = "register";

  let username = "";
  let password = "";
  let name = "";

  let loading = false;

  async function register() {
    loading = true;
    const res = await makeBackendRequest<RegisterRequest, any>({
      body: {
        user_name: username,
        password,
        name,
      },
    })("auth", "register");

    if (res.success) {
      addToast({ message: `Successfully registered ${username}`, type: TOAST_TYPES.SUCCESS });
      await login();
    } else {
      addToast({ message: `Failed to register`, type: TOAST_TYPES.ERROR });
    }

    loading = false;
  }

  async function login() {
    const res = await makeBackendRequest<LoginRequest, any>({
      body: { user_name: username, password },
    })("auth", "login");

    if (res.success) {
      const data = res.data;

      localStorage.setItem("jwt", data.token);
      auth.set({ token: data.token, username });
    } else {
      addToast({ message: `Failed to login`, type: TOAST_TYPES.ERROR });
      mode = "login";
    }
  }
</script>

<div
  class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4"
  in:fade={{ duration: 200, delay: 50 }}
  out:fade={{ duration: 50 }}
>
  <h3>Register</h3>

  <div class="flex flex-col">
    <label for="name" class="w-max"> Name </label>
    <input type="text" id="name" bind:value={name} />
    <label for="username" class="w-max"> Username </label>
    <input type="text" id="username" bind:value={username} />
    <label for="password" class="w-max"> Password </label>
    <input type="password" id="password" bind:value={password} />
  </div>

  <button on:click={register} disabled={loading}>
    {#if loading}
      Registering...
    {:else}
      Register
    {/if}
  </button>

  <p class="text-base flex items-center">
    Have an account?
    <button class="ghost" on:click={() => (mode = "login")} disabled={loading}>Login instead</button
    >
  </p>
</div>

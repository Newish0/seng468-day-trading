<script lang="ts">
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { auth } from "./auth";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";

  export let mode: "login" | "register" = "register";

  let username = "";
  let password = "";
  let name = "";

  let loading = false;

  async function register() {
    loading = true;
    // TODO: revisit once auth service is in and add types
    const res = await makeInternalRequest<any, any>({
      body: {
        user_name: username,
        password,
        name,
      },
      //@ts-ignore
    })("auth", "register");

    if (res.success) {
      const data = res.data;

      localStorage.setItem("jwt", data.token);
      auth.set({ token: data.token, username: data.user });
      mode = "register";
    } else {
      addToast({ message: `Failed to register`, type: TOAST_TYPES.ERROR });
    }

    loading = false;
  }
</script>

<div class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4">
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

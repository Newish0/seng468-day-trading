<script lang="ts">
  import { makeInternalRequest } from "shared-utils/internalCommunication";
  import { auth } from "./auth";
  import { addToast, TOAST_TYPES } from "../Toast/toastStore";
  let username = "";
  let password = "";

  async function register() {
    // TODO: revisit once auth service is in and add types
    const res = await makeInternalRequest<any, any>({
      body: { username, password },
      //@ts-ignore
    })("auth", "register");

    if (res.success) {
      const data = res.data;
      localStorage.setItem("jwt", data.token);
      auth.set({ token: data.token, user: data.user });

      username = "";
      password = "";
    } else {
      addToast({ message: `Failed to register`, type: TOAST_TYPES.ERROR });
    }
  }
</script>

<div class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4">
  <h3>Register</h3>

  <div class="flex flex-col">
    <label for="username" class="w-max"> Username </label>
    <input type="text" id="username" bind:value={username} />
    <label for="password" class="w-max"> Password </label>
    <input type="password" id="password" bind:value={password} />
  </div>

  <button on:click={register}>Register</button>

  <p class="text-base flex items-center">
    Have an account?
    <button class="ghost" on:click>Login instead</button>
  </p>
</div>

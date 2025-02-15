<script>
  import { auth } from "./auth";

  function logout() {
    localStorage.removeItem("jwt");
    auth.set({ token: null, username: null });
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div class="flex flex-col items-end">
  <button class="!font-mono !p-1 !px-4" on:click={logout}>Log out</button>
</div>

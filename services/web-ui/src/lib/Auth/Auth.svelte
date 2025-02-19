<script lang="ts">
  import Login from "./Login.svelte";
  import Register from "./Register.svelte";

  let mode: "login" | "register" = "login";
</script>

<div class="mx-auto w-full max-w-lg">
  {#if mode === "register"}
    <Register bind:mode />
  {:else}
    <Login bind:mode />
  {/if}
</div>

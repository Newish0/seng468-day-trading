<script lang="ts">
  import Login from "./Login.svelte";
  import Register from "./Register.svelte";

  export let mode: "login" | "register" = "register";
</script>

<div>
  {#if mode === "register"}
    <Register on:click={() => (mode = "login")} />
  {:else}
    <Login on:click={() => (mode = "register")} />
  {/if}
</div>

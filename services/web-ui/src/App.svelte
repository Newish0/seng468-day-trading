<script lang="ts">
  import Counter from "./lib/Counter.svelte";
</script>

<main>
  <h1>Trade Simple</h1>

  <div class="card">
    <Counter />
  </div>
</main>

<style>
  main {
    max-width: 1200px;
    display: flex;
    flex-direction: column;
    margin: 0 auto;
  }
</style>

<script>
  import { flip } from "svelte/animate";
  import { fly } from "svelte/transition";
  import { toasts } from "./toastStore";

  const toastClasses = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
  };
</script>

<div class="fixed top-5 left-1/2 transform -translate-x-1/2 flex flex-col gap-2 z-50 w-full max-w-sm">
  {#each $toasts as { id, message, type } (id)}
    <div
      class={`px-4 py-2 rounded shadow-lg text-sm text-center w-80 ${toastClasses[type] || "bg-gray-700 text-white"}`}
      transition:fly|fade={{ y: -20, duration: 300 }}
      animate:flip|duration={{duration: 300}}
      style="will-change: transform, opacity;"
    >
      {message}
    </div>
  {/each}
</div>

<style>
  @keyframes fade-in-out {
    0% { opacity: 0; transform: translateY(-10px); }
    10% { opacity: 1; transform: translateY(0); }
    90% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(-10px); }
  }
  
  .animate-fade-in-out {
    animation: fade-in-out 3s ease-in-out;
  }
</style>
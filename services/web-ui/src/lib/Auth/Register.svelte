<div class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4">
  <h3>Register</h3>

  <div class="flex flex-col">
    <label for="username" class="w-max"> Username </label>
    <input type="text" id="username" />
    <label for="password" class="w-max"> Password </label>
    <input type="password" id="password" />
  </div>

  <button>Register</button>

  <p class="text-mono">
    New to TradeSimple?
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_missing_attribute -->
    <a class="cursor-pointer" on:click> Register instead </a>
  </p>
</div>

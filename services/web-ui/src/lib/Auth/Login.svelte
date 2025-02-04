<div class="p-8 px-12 border rounded-3xl max-w-[500px] flex flex-col gap-4">
  <h3>Login</h3>

  <div class="flex flex-col">
    <label for="username" class="w-max"> Username </label>
    <input type="text" id="username" />
    <label for="password" class="w-max"> Password </label>
    <input type="password" id="password" />
  </div>

  <button>Login</button>

  <p class="text-mono">
    Have an account?
    <button class="ghost" on:click> Login instead </button>
  </p>
</div>

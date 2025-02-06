<script>
  import { auth } from "./auth";

  function logout() {
    localStorage.removeItem("jwt");
    auth.set({ token: null, user: null });
  }
</script>

<button on:click={logout}>Logout</button>

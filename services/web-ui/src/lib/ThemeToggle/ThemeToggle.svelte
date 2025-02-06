<script>
  import { onMount } from "svelte";

  // Keep track of the current theme in a local variable (default to dark)
  let theme = "dark";

  // Toggle function to switch themes
  function toggleTheme() {
    if (theme === "light") {
      theme = "dark";
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("theme", "dark");
    } else {
      theme = "light";
      document.documentElement.setAttribute("data-theme", "light");
      localStorage.setItem("theme", "light");
    }
  }

  // On mount, check for a saved theme in localStorage
  onMount(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
      theme = "light";
      document.documentElement.setAttribute("data-theme", "light");
    }
  });
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_missing_attribute -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<a class="!cursor-pointer !text-sm !font-mono !p-2" on:click={toggleTheme}>
  Use {theme === "dark" ? "light" : "dark"} mode
</a>

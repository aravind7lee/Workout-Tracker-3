// Apply the saved theme before React mounts to avoid a light/dark flash.
(function initializeTheme() {
  try {
    const savedTheme = localStorage.getItem("theme");
    const theme = savedTheme === "light" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    root.classList.toggle("light", theme === "light");
    root.setAttribute("data-theme", theme);
    root.style.colorScheme = theme;
  } catch (error) {
    document.documentElement.classList.add("dark");
    document.documentElement.setAttribute("data-theme", "dark");
  }
})();

document.querySelectorAll("[data-href]").forEach((button) => {
  button.addEventListener("click", () => {
    window.location.href = button.dataset.href;
  });
});

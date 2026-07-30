(() => {
  const email = "hamasaki@bassment.co.jp";
  async function copyEmail(link) {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      const area = document.createElement("textarea");
      area.value = email;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
    }
    const tooltip = link.querySelector(".copy-tooltip");
    if (!tooltip) return;
    tooltip.textContent = "コピーしました";
    link.classList.add("is-copied");
    setTimeout(() => {
      tooltip.textContent = "メールアドレスをコピー";
      link.classList.remove("is-copied");
    }, 1800);
  }
  document.querySelectorAll("[data-copy-email]").forEach(link => {
    link.addEventListener("click", event => {
      event.preventDefault();
      copyEmail(link);
    });
  });
})();

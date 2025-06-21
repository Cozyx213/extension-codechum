// gpt-solution-button.js
(() => {
  /* -------------------------------------------------- *
   * 1.  Inject minimal spinner CSS                     *
   * -------------------------------------------------- */
  const style = document.createElement("style");
  style.textContent = `
    @keyframes gptSpin { to { transform: rotate(360deg); } }
    .gpt-spinner{
      width:14px;height:14px;border:2px solid #0003;border-top-color:#000;
      border-radius:50%;display:inline-block;animation:gptSpin .8s linear infinite;
    }`;
  document.head.appendChild(style);

  /* -------------------------------------------------- *
   * 2.  Main helper—runs once per eligible page load   *
   * -------------------------------------------------- */
  function injectGptButton() {
    const titleEl = document.querySelector(".styles_text___heading___xs__Qdbcu");
    const descEl  = document.querySelector(".styles_description__sQT3h");
    if (!titleEl || !descEl || document.getElementById("gpt-help-btn")) return;

    const title = titleEl.textContent;
    const desc  = descEl.textContent;

    /* ----- create button ----- */
    const btn = document.createElement("button");
    btn.id   = "gpt-help-btn";
    btn.textContent = "Solution";
    Object.assign(btn.style, {
      marginLeft: "10px",
      padding:    "6px 12px",
      fontSize:   "14px",
      background: "#FFF",
      color:      "#000",
      border:     "none",
      borderRadius: "5px",
      cursor:     "pointer"
    });

    /* ----- click handler with spinner ----- */
    btn.addEventListener("click", async () => {
      if (btn.dataset.loading === "true") return;     // block double-clicks
      btn.dataset.loading = "true";
      const originalHTML  = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<span class="gpt-spinner"></span>';

      try {
        const res = await fetch("http://127.0.0.1:5000/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, desc })
        });
        const out = await res.json();
        if (out.id) {
          window.open(`http://127.0.0.1:5000/solution?title=${out.id}`, "_blank");
        } else {
          console.error("Error: No ID returned", out);
        }
      } catch (err) {
        console.error("Network or server error:", err);
      } finally {
        btn.innerHTML = originalHTML;
        btn.disabled  = false;
        delete btn.dataset.loading;
      }
    });

    /* ----- insert into DOM next to the title ----- */
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.gap = "10px";

    titleEl.parentNode.insertBefore(wrapper, titleEl);
    wrapper.appendChild(titleEl);
    wrapper.appendChild(btn);
  }

  /* -------------------------------------------------- *
   * 3.  Run once + observe for SPA route changes       *
   * -------------------------------------------------- */
  injectGptButton();
  const observer = new MutationObserver(injectGptButton);
  observer.observe(document.body, { childList: true, subtree: true });
})();

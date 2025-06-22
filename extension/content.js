
// gpt-solution-button.js
(() => {
    /* -------------------------------------------------- *
     * 1.  Inject minimal spinner CSS                     *
     * -------------------------------------------------- */
    const style = document.createElement("style");
    style.textContent = `
    @keyframes gptSpin { to { transform: rotate(360deg); } }
    .gpt-spinner{
      width:14px;height:14px;border:2px solid #808080;border-top-color:#000;
      border-radius:50%;display:inline-block;animation:gptSpin .8s linear infinite;
    }`;
    document.head.appendChild(style);

    /* -------------------------------------------------- *
     * 2.  Main helper—runs once per eligible page load   *
     * -------------------------------------------------- */
    function injectGptButton() {
        // Select the input element by its type and name attribute
        

        const titleEl = document.querySelector(
            ".styles_text___heading___xs__Qdbcu"
        );

        const descElem = document.querySelector(
            '[data-testid="problemDescription"]'
        );

        const examElem = document.querySelector(".styles_description__sQT3h");
        if (
            !titleEl ||
            !descElem ||
            descElem.textContent.trim() == "" ||
            !examElem ||
            document.getElementById("gpt-help-btn") ||
            !document.querySelector(".styles_markdown__uJNjw")
        )
            return;

        
        const prob = descElem.textContent.trim();
        const exam = examElem.textContent.trim();
        // If exam is needed in the fetch body, include it; otherwise, remove the next line.
     

        /* ----- create button ----- */

        const themeElem = document.querySelector('.styles_icon__Qu5G7.styles_button_icon__QuZsh');
        var col;
        var textCol;
        if(themeElem){
            const text = themeElem.textContent;
            if(text==="brightness_2"){
                col ="#34383a"
                textCol= "#FFF"
            }else{
                col = "#FFF"
                textCol = "#000"
               
            }
            console.log(text)
        }else{
            return;
        }
        const btn = document.createElement("button");
        btn.id = "gpt-help-btn";
        btn.textContent = "Solution";
        Object.assign(btn.style, {
            marginLeft: "10px",
            padding: "6px 12px",
            fontSize: "14px",
            background: col,
            color: textCol,
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
        });

        /* ----- click handler with spinner ----- */
        btn.addEventListener("click", async () => {
            const langElem = document.querySelector('[data-testid="singleValueLabel"]')
            const lang = langElem.textContent;
            const title = titleEl.textContent + ` (${lang})`;
            const desc = "Using the language " + lang + ", " + prob + exam;
            console.log(title)
            console.log(desc)


            const encodedTitle = encodeURIComponent(title)
            if (btn.dataset.loading === "true") return; // block double-clicks
            btn.dataset.loading = "true";
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="gpt-spinner"></span>';

            try {
                const res = await fetch("http://127.0.0.1:5000/submit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ title, desc }),
                });
                const out = await res.json();
                if (out.id) {
                    window.open(
                        `http://127.0.0.1:5000/solution?title=${encodedTitle}`,
                        "_blank"
                    );
                } else {
                    console.error("Error: No ID returned", out);
                }
            } catch (err) {
                console.error("Network or server error:", err);
            } finally {
                btn.innerHTML = originalHTML;
                btn.disabled = false;
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

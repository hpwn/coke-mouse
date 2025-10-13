import { iconSvg, type IconName } from "./icons";

/**
 * Progressive enhancement:
 * - For any element with [data-icon], prepend an inline SVG and add tooltip.
 * - For common buttons (by innerText), we add an icon without changing text.
 * Usage: call iconize() on DOMContentLoaded.
 */
export function iconize(root: ParentNode = document) {
  const byAttr = root.querySelectorAll<HTMLElement>("[data-icon]");
  byAttr.forEach(el => {
    const name = (el.getAttribute("data-icon") || "") as IconName;
    if (!name) return;
    if (!el.querySelector(".cm-ico")) {
      const span = document.createElement("span");
      span.className = "cm-ico";
      span.innerHTML = iconSvg(name);
      el.prepend(span);
    }
    el.classList.add("cm-btn","cm-tooltip");
    if (!el.getAttribute("data-tooltip") && el.getAttribute("aria-label")) {
      el.setAttribute("data-tooltip", el.getAttribute("aria-label")!);
    }
    if (!el.querySelector(".cm-label")) {
      const txt = Array.from(el.childNodes).find(n=>n.nodeType===Node.TEXT_NODE && n.textContent?.trim());
      if (txt) {
        const wrap = document.createElement("span");
        wrap.className = "cm-label";
        wrap.textContent = txt.textContent || "";
        el.replaceChild(wrap, txt);
      }
    }
  });

  const textMap: Record<string, IconName> = {
    "Export JSON":"download","Export CSV":"download","Browse...":"list",
    "Log Now":"play","Log Time...":"clock","Delete":"trash",
    "Show timeline":"list","Add":"plus","Active":"target","Queued":"list","Archived":"list","All":"list",
    "Positive":"plus","Negative":"trash"
  };
  root.querySelectorAll<HTMLButtonElement>("button, a[role='button']").forEach(btn=>{
    const text = btn.textContent?.trim() || "";
    const name = textMap[text as keyof typeof textMap];
    if (!name) return;
    if (!btn.querySelector(".cm-ico")) {
      const span = document.createElement("span");
      span.className = "cm-ico";
      span.innerHTML = iconSvg(name);
      btn.prepend(span);
      btn.classList.add("cm-btn","cm-tooltip");
      if (!btn.getAttribute("data-tooltip")) btn.setAttribute("data-tooltip", text);
      if (!btn.querySelector(".cm-label")) {
        const lab = document.createElement("span");
        lab.className = "cm-label"; lab.textContent = text;
        btn.textContent = ""; btn.append(span, lab);
      }
    }
  });
}

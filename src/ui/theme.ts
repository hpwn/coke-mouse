import { iconize } from "./iconize";
import { iconSvg } from "./icons";

type Theme = "light"|"dark";
const KEY = "cm.theme";

export function getTheme(): Theme {
  const t = localStorage.getItem(KEY) as Theme | null;
  if (t === "light" || t === "dark") return t;
  // fallback to what bootstrap wrote
  const attr = (document.documentElement.getAttribute("data-theme") as Theme) || "light";
  return attr;
}
export function setTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t);
  localStorage.setItem(KEY, t);
}

function mountToggle() {
  const div = document.createElement("div");
  div.className = "cm-theme-toggle";
  const btn = document.createElement("button");
  btn.className = "cm-btn cm-tooltip";
  btn.setAttribute("aria-label","Toggle theme");
  btn.setAttribute("data-tooltip","Toggle theme");
  btn.innerHTML = `<span class="cm-ico">${iconSvg(getTheme()==="dark"?"sun":"moon")}</span><span class="cm-label">Theme</span>`;
  btn.addEventListener("click", ()=> {
    const next: Theme = getTheme()==="dark" ? "light" : "dark";
    setTheme(next);
    (btn.querySelector(".cm-ico") as HTMLElement).innerHTML = iconSvg(next==="dark"?"sun":"moon");
  });
  div.appendChild(btn);
  document.body.appendChild(div);
}

document.addEventListener("DOMContentLoaded", () => {
  // Enhance existing buttons (non-invasive)
  try { iconize(document); } catch {}
  // Toggle
  try { mountToggle(); } catch {}
});

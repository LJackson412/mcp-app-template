if (!window.openai) {
  const { installOpenAIMock } = await import("./mock.js");
  installOpenAIMock();
}

const widgetEl = document.querySelector("#greetWidget");

// optional: max height vom Host übernehmen
if (window.openai?.maxHeight) {
  document.documentElement.style.setProperty("--max-height", `${window.openai.maxHeight}px`);
}

// initiales tool output (falls Host das direkt setzt)
let greetData = window.openai?.toolOutput ?? null;

function render() {
  if (!greetData) {
    widgetEl.innerHTML = `<div class="card"><div class="value" style="text-align:center;">Waiting for greeting...</div></div>`;
    return;
  }

  // Erwartet: { name: string, message: string }
  const name = greetData.name ?? "";
  const message = greetData.message ?? "";

  widgetEl.innerHTML = `
    <div class="message">${escapeHtml(message)}</div>
    <div class="card" style="margin-top: 12px;">
      <div class="row">
        <div class="label">Name</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
    </div>
  `;
}

// Wenn die Runtime später neue globals (toolOutput) pusht:
function handleSetGlobals(event) {
  const globals = event.detail?.globals;
  if (!globals?.toolOutput) return;

  greetData = globals.toolOutput;
  render();
}

window.addEventListener("openai:set_globals", handleSetGlobals, { passive: true });

render();

// --- helpers ---
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
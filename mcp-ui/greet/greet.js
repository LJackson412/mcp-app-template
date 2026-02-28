if (window.parent === window) {
  const { installPostMessageHostMock } = await import("./mock.js");
  installPostMessageHostMock();
}

const widgetEl = document.querySelector("#greetWidget");

let greetData = null;
let rpcId = 0;
const pendingRequests = new Map();

function rpcRequest(method, params = {}) {
  const id = `${Date.now()}-${++rpcId}`;

  const request = {
    jsonrpc: "2.0",
    id,
    method,
    params,
  };

  window.parent.postMessage(request, "*");

  return new Promise((resolve, reject) => {
    pendingRequests.set(id, { resolve, reject });
  });
}

function rpcNotify(method, params = {}) {
  window.parent.postMessage(
    {
      jsonrpc: "2.0",
      method,
      params,
    },
    "*"
  );
}

function render() {
  if (!greetData) {
    widgetEl.innerHTML = `<div class="card"><div class="value" style="text-align:center;">Waiting for greeting...</div></div>`;
    return;
  }

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

function extractStructuredContent(params) {
  if (!params || typeof params !== "object") {
    return null;
  }

  if (params.structuredContent && typeof params.structuredContent === "object") {
    return params.structuredContent;
  }

  if (params.result?.structuredContent && typeof params.result.structuredContent === "object") {
    return params.result.structuredContent;
  }

  return null;
}

function handleRpcMessage(event) {
  const data = event.data;
  if (!data || typeof data !== "object" || data.jsonrpc !== "2.0") {
    return;
  }

  if (data.id && (Object.hasOwn(data, "result") || Object.hasOwn(data, "error"))) {
    const pendingRequest = pendingRequests.get(data.id);
    if (!pendingRequest) {
      return;
    }

    pendingRequests.delete(data.id);
    if (Object.hasOwn(data, "error")) {
      pendingRequest.reject(data.error);
      return;
    }

    pendingRequest.resolve(data.result);
    return;
  }

  if (data.method === "ui/notifications/tool-input") {
    return;
  }

  if (data.method === "ui/notifications/tool-result") {
    const structuredContent = extractStructuredContent(data.params);
    if (!structuredContent) {
      return;
    }

    greetData = {
      name: structuredContent.name ?? "",
      message: structuredContent.message ?? "",
    };

    render();
  }
}

window.addEventListener("message", handleRpcMessage, { passive: true });

render();

try {
  await rpcRequest("ui/initialize", {});
  rpcNotify("ui/notifications/initialized", {});
} catch (error) {
  console.error("Failed to initialize widget bridge", error);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function installPostMessageHostMock() {
  const postToWidget = (payload) => {
    window.postMessage(payload, "*");
  };

  window.addEventListener("message", (event) => {
    const data = event.data;
    if (!data || typeof data !== "object" || data.jsonrpc !== "2.0") {
      return;
    }

    if (data.method === "ui/initialize" && data.id) {
      postToWidget({
        jsonrpc: "2.0",
        id: data.id,
        result: {
          ok: true,
        },
      });
      return;
    }

    if (data.method === "ui/notifications/initialized") {
      postToWidget({
        jsonrpc: "2.0",
        method: "ui/notifications/tool-input",
        params: {
          input: {
            name: "Ada",
          },
        },
      });

      postToWidget({
        jsonrpc: "2.0",
        method: "ui/notifications/tool-result",
        params: {
          structuredContent: {
            name: "Ada",
            message: "Hello, Ada 👋",
          },
        },
      });

      setTimeout(() => {
        postToWidget({
          jsonrpc: "2.0",
          method: "ui/notifications/tool-result",
          params: {
            structuredContent: {
              name: "Grace",
              message: "Hello, Grace 👋",
            },
          },
        });
      }, 2000);
    }
  });
}

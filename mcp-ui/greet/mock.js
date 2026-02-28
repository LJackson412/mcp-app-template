export function installOpenAIMock() {
  window.openai = {
    maxHeight: 600,
    toolOutput: {
      name: "Ada",
      message: "Hello, Ada 👋",
    },
  };

  // Optional: Update nach 2 Sekunden simulieren
  setTimeout(() => {
    window.dispatchEvent(
      new CustomEvent("openai:set_globals", {
        detail: {
          globals: {
            toolOutput: {
              name: "Grace",
              message: "Hello, Grace 👋",
            },
          },
        },
      })
    );
  }, 2000);
}
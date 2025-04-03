const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173", // Vite default port
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

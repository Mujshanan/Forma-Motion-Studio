// Keep the renderer isolated. Expose only narrowly scoped APIs here when needed.
const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("forma", Object.freeze({
  platform: process.platform,
  appName: "Forma Motion Studio"
}));
const { app, BrowserWindow, dialog } = require("electron");
const fs = require("node:fs");
const path = require("node:path");

const isDev = !app.isPackaged;
const logFile = path.join(app.getPath("userData"), "startup.log");

function log(message) {
  try {
    fs.mkdirSync(path.dirname(logFile), { recursive: true });
    fs.appendFileSync(logFile, new Date().toISOString() + " " + message + "\n");
  } catch {}
}

function createWindow() {
  log("Creating BrowserWindow; packaged=" + app.isPackaged);
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 980,
    minHeight: 640,
    show: true,
    backgroundColor: "#17191f",
    title: "Forma Motion Studio UI Preview",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  window.webContents.on("did-fail-load", (_event, code, description, url) => {
    log("did-fail-load code=" + code + " description=" + description + " url=" + url);
  });
  window.webContents.on("render-process-gone", (_event, details) => {
    log("render-process-gone " + JSON.stringify(details));
  });
  window.webContents.on("console-message", (_event, details) => {
    if (details.level >= 2) log("renderer-console " + details.message);
  });

  const page = isDev
    ? window.loadURL("http://127.0.0.1:5173")
    : window.loadFile(path.join(__dirname, "../dist/index.html"));

  page.catch(error => {
    log("Failed to load renderer: " + (error.stack || error.message || String(error)));
    dialog.showErrorBox("Forma Motion Studio failed to start", error.message + "\n\nStartup log: " + logFile);
  });

  return window;
}

process.on("uncaughtException", error => {
  log("uncaughtException " + (error.stack || error.message));
});
process.on("unhandledRejection", error => {
  log("unhandledRejection " + String(error));
});

app.whenReady().then(() => {
  log("Electron ready; version=" + app.getVersion());
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(error => {
  log("app.whenReady failed: " + (error.stack || error.message));
  dialog.showErrorBox("Forma Motion Studio startup error", error.message);
});

app.on("window-all-closed", () => {
  log("All windows closed");
  if (process.platform !== "darwin") app.quit();
});

const { contextBridge, ipcRenderer } = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("electronAPI", {
  // Example: Send a message to the main process
  sendMessage: (message) => ipcRenderer.send("message", message),

  // Example: Receive a message from the main process
  onMessage: (callback) => {
    ipcRenderer.on("message", callback);
  },

  // Example: Get app version
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),

  // Example: Open file dialog
  openFile: () => ipcRenderer.invoke("dialog:openFile"),

  // Example: Save file dialog
  saveFile: (data) => ipcRenderer.invoke("dialog:saveFile", data),

  // Configuration APIs
  getConfig: (key) => ipcRenderer.invoke("config:get", key),
  setConfig: (key, value, description) =>
    ipcRenderer.invoke("config:set", key, value, description),
  getAllConfig: () => ipcRenderer.invoke("config:getAll"),

  // MariaDB configuration
  getMariaDBConfig: () => ipcRenderer.invoke("config:getMariaDB"),
  setMariaDBConfig: (config) => ipcRenderer.invoke("config:setMariaDB", config),
  testDatabaseConnection: (config) =>
    ipcRenderer.invoke("config:testDatabase", config),

  // AWS configuration
  getAWSConfig: () => ipcRenderer.invoke("config:getAWS"),
  setAWSConfig: (config) => ipcRenderer.invoke("config:setAWS", config),

  // Folder selection
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),

  // Remove all listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
});

// Handle window controls
contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});

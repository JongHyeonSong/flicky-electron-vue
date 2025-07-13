const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 메시지 전송 예시
  sendMessage: (message) => ipcRenderer.send("message", message),
  onMessage: (callback) => {
    ipcRenderer.on("message", callback);
  },
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  openFile: () => ipcRenderer.invoke("dialog:openFile"),
  saveFile: (data) => ipcRenderer.invoke("dialog:saveFile", data),
  getConfig: (key) => ipcRenderer.invoke("config:get", key),
  setConfig: (key, value, description) =>
    ipcRenderer.invoke("config:set", key, value, description),
  getAllConfig: () => ipcRenderer.invoke("config:getAll"),
  getMariaDBConfig: () => ipcRenderer.invoke("config:getMariaDB"),
  setMariaDBConfig: (config) => ipcRenderer.invoke("config:setMariaDB", config),
  getAWSConfig: () => ipcRenderer.invoke("config:getAWS"),
  setAWSConfig: (config) => ipcRenderer.invoke("config:setAWS", config),
  selectFolder: () => ipcRenderer.invoke("dialog:selectFolder"),
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  // DB 연결 상태 구독
  onDBConnectionStatus: (callback) => {
    ipcRenderer.on("db-connection-status", (event, status) => callback(status));
  },
  // DB 연결 테스트
  testDBConnection: (config) => ipcRenderer.invoke("testDBConnection", config),
});

contextBridge.exposeInMainWorld("windowControls", {
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
});

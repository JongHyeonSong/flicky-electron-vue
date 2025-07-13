const {
  app,
  BrowserWindow,
  Menu,
  ipcMain,
  dialog,
  screen,
} = require("electron");
const path = require("path");
const mariadb = require("mariadb");

// Import logging system
const logger = require("./logger");
const configService = require("./services/configService");
const databaseService = require("./services/databaseService");
const tableService = require("./services/tableService");
const queryService = require("./services/queryService");

// Create main process logger
const mainLogger = logger.createServiceLogger("MainProcess");

// Main process logger initialized

const isDev = !app.isPackaged;
let mainWindow;
let dbConnectionStatus = {
  status: "pending", // 'pending' | 'connected' | 'failed'
  message: "DB 연결 시도중...",
};

async function asyncInitDatabaseService() {
  dbConnectionStatus = { status: "pending", message: "DB 연결 시도중..." };
  if (mainWindow) {
    mainWindow.webContents.send("db-connection-status", dbConnectionStatus);
  }
  try {
    await databaseService.init();
    dbConnectionStatus = { status: "connected", message: "DB 연결 성공" };
    mainLogger.info("Database connected");
  } catch (err) {
    dbConnectionStatus = {
      status: "failed",
      message: "DB 연결 실패: " + err.message,
    };
    mainLogger.error("Database connection failed", { error: err.message });
  }
  if (mainWindow) {
    mainWindow.webContents.send("db-connection-status", dbConnectionStatus);
  }
}

function createWindow() {
  // Get all displays
  const displays = screen.getAllDisplays();
  const primaryDisplay = screen.getPrimaryDisplay();

  // Find the secondary display (right screen)
  const secondaryDisplay = displays.find(
    (display) => display.id !== primaryDisplay.id
  );

  // Use secondary display if available, otherwise primary
  const targetDisplay = isDev
    ? secondaryDisplay || primaryDisplay
    : primaryDisplay;

  // Use bounds instead of workArea to get full screen dimensions
  const screenBounds = targetDisplay.bounds;

  // Create window that fills the entire screen but keeps title bar
  mainWindow = new BrowserWindow({
    width: screenBounds.width,
    height: screenBounds.height,
    x: screenBounds.x,
    y: screenBounds.y,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/icon.png"),
    show: false,
    frame: true, // Keep title bar with buttons
    titleBarStyle: "default", // Standard title bar
    minimizable: true,
    maximizable: true,
    closable: true,
    fullscreenable: false, // Prevent F11 fullscreen
    resizable: true, // Allow resizing
    minWidth: 800,
    minHeight: 600,
  });

  // Load the application
  if (isDev) {
    mainWindow.loadURL("http://localhost:5555");
    // mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  // Show window when ready and maximize it
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize(); // This will make it fill the screen properly
    // 개발 환경이면 DevTools 자동 오픈
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
    // 창이 준비되면 현재 DB 상태도 즉시 전송
    mainWindow.webContents.send("db-connection-status", dbConnectionStatus);
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// App ready
app.whenReady().then(async () => {
  // Initialize services
  try {
    mainLogger.info("Application starting...");

    // Initialize config service
    const allConfig = await configService.getAllConfig();
    mainLogger.info("Config service initialized", {
      configCount: allConfig.length,
    });

    // Initialize database service (if configured)
    try {
      // await databaseService.init();
      // const tableStatus = await tableService.checkTablesExist();
      // if (!tableStatus.exists) {
      //   mainLogger.info("Creating database tables...");
      //   await tableService.createTables();
      // }
      // mainLogger.info("Database service initialized successfully");
    } catch (dbError) {
      mainLogger.warn("Database service not configured", {
        error: dbError.message,
      });
    }

    mainLogger.info("All services initialized");
  } catch (error) {
    mainLogger.error("Service initialization failed", { error: error.message });
  }

  createWindow();
  // 창이 준비되면 DB 연결 비동기 시도
  setTimeout(() => asyncInitDatabaseService(), 1000);

  // DB 연결 테스트 IPC 핸들러 (중복 방지, 반드시 app.whenReady 이후 등록)
  // ipcMain.handle("test-db-connection", async (event, config) => {
  //   console.log("test-db-connection called", config);
  //   return 123;
  // });

  // Menu template
  const template = [
    {
      label: "File",
      submenu: [
        { label: "New", accelerator: "CmdOrCtrl+N" },
        { type: "separator" },
        { label: "Exit", accelerator: "CmdOrCtrl+Q", click: () => app.quit() },
      ],
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
      ],
    },
    {
      label: "Window",
      submenu: [{ role: "minimize" }, { role: "close" }],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
});

// App event handlers
app.on("window-all-closed", async () => {
  mainLogger.info("Application shutting down...");

  try {
    if (databaseService.isConnected) {
      await databaseService.close();
    }
    configService.close();
    mainLogger.info("Services closed");
  } catch (error) {
    mainLogger.error("Error closing services", { error: error.message });
  }

  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers
ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.handle("dialog:openFile", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: [
      { name: "All Files", extensions: ["*"] },
      { name: "Text Files", extensions: ["txt", "md", "json"] },
      { name: "Images", extensions: ["jpg", "jpeg", "png", "gif", "svg"] },
    ],
  });
  return result;
});

ipcMain.handle("dialog:saveFile", async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    filters: [
      { name: "Text Files", extensions: ["txt", "md", "json"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });
  return result;
});

ipcMain.handle("dialog:selectFolder", async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openDirectory"],
  });
  return result;
});

// Configuration handlers
ipcMain.handle("config:get", async (event, key) => {
  try {
    return await configService.getConfig(key);
  } catch (error) {
    mainLogger.error("Error getting config", { key, error: error.message });
    throw error;
  }
});

ipcMain.handle("config:set", async (event, key, value, description) => {
  try {
    await configService.setConfig(key, value, description);
    return { success: true };
  } catch (error) {
    mainLogger.error("Error setting config", { key, error: error.message });
    throw error;
  }
});

ipcMain.handle("config:getAll", async () => {
  try {
    return await configService.getAllConfig();
  } catch (error) {
    mainLogger.error("Error getting all config", { error: error.message });
    throw error;
  }
});

ipcMain.handle("config:getMariaDB", async () => {
  try {
    return await configService.getMariaDBConfig();
  } catch (error) {
    mainLogger.error("Error getting MariaDB config", { error: error.message });
    throw error;
  }
});

ipcMain.handle("config:setMariaDB", async (event, config) => {
  try {
    await configService.setMariaDBConfig(config);
    return { success: true };
  } catch (error) {
    mainLogger.error("Error setting MariaDB config", { error: error.message });
    throw error;
  }
});

ipcMain.handle("config:testDatabase", async (event, config) => {
  try {
    const testDB = new (require("./services/databaseService").constructor)();
    await testDB.init();
    await testDB.close();
    return { success: true };
  } catch (error) {
    mainLogger.error("Database connection test failed", {
      error: error.message,
    });
    return { success: false, error: error.message };
  }
});

ipcMain.handle("config:getAWS", async () => {
  try {
    return await configService.getAWSConfig();
  } catch (error) {
    mainLogger.error("Error getting AWS config", { error: error.message });
    throw error;
  }
});

ipcMain.handle("config:setAWS", async (event, config) => {
  try {
    await configService.setAWSConfig(config);
    return { success: true };
  } catch (error) {
    mainLogger.error("Error setting AWS config", { error: error.message });
    throw error;
  }
});

ipcMain.handle("testDBConnection", async (event, config) => {
  mainLogger.info("testDBConnection handle received", { config });
  const DatabaseService = require("./services/databaseService").constructor;
  const testDB = new DatabaseService();
  try {
    // MariaDB config를 임시로 세팅
    const mariadb = require("mariadb");
    testDB.pool = mariadb.createPool({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.username,
      password: config.password,
      connectionLimit: 2,
      acquireTimeout: 5000,
      timeout: 5000,
      trace: false,
    });
    await testDB.testConnection();
    await testDB.close();
    return { success: true, message: "DB 연결 성공" };
  } catch (error) {
    mainLogger.error("DB 연결 테스트 실패", { error: error.message });
    return { success: false, message: error.message };
  }
});

// Window control handlers
ipcMain.on("window:minimize", () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on("window:maximize", () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on("window:close", () => {
  if (mainWindow) mainWindow.close();
});

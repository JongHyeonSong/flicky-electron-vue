const initSqlJs = require("sql.js");
const path = require("path");
const fs = require("fs");
const { createServiceLogger } = require("../logger");

const logger = createServiceLogger("ConfigService");

class ConfigService {
  constructor() {
    this.dbPath = path.join(process.cwd(), "config.db");
    this.db = null;
    this.SQL = null;
    this.ready = this.init();
  }

  async init() {
    try {
      this.SQL = await initSqlJs();
      let dbFile;
      if (fs.existsSync(this.dbPath)) {
        dbFile = fs.readFileSync(this.dbPath);
        this.db = new this.SQL.Database(new Uint8Array(dbFile));
      } else {
        this.db = new this.SQL.Database();
      }
      await this.createTables();
      logger.info("Configuration service initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize configuration service", {
        error: error.message,
      });
      throw error;
    }
  }

  async createTables() {
    const createConfigTable = `
      CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const createMariaDBTable = `
      CREATE TABLE IF NOT EXISTS mariadb_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        host TEXT NOT NULL,
        port INTEGER DEFAULT 3306,
        database TEXT NOT NULL,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    const createAWSTable = `
      CREATE TABLE IF NOT EXISTS aws_config (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        access_key_id TEXT NOT NULL,
        secret_access_key TEXT NOT NULL,
        region TEXT DEFAULT 'us-east-1',
        bucket_name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;
    this.db.run(createConfigTable);
    this.db.run(createMariaDBTable);
    this.db.run(createAWSTable);
    this.save();
  }

  save() {
    // Save DB to file
    const data = this.db.export();
    fs.writeFileSync(this.dbPath, Buffer.from(data));
  }

  async setConfig(key, value, description = "") {
    await this.ready;
    const sql = `
      INSERT OR REPLACE INTO config (key, value, description, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;
    this.db.run(sql, [key, value, description]);
    this.save();
    logger.info("Config set successfully", { key });
  }

  async getConfig(key) {
    await this.ready;
    const sql = "SELECT value FROM config WHERE key = ?";
    const stmt = this.db.prepare(sql, [key]);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row.value;
    }
    stmt.free();
    return null;
  }

  async getAllConfig() {
    await this.ready;
    const sql = "SELECT key, value, description FROM config";
    const stmt = this.db.prepare(sql);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  }

  async setMariaDBConfig(config) {
    await this.ready;
    const sql = `
      INSERT OR REPLACE INTO mariadb_config 
      (id, host, port, database, username, password, updated_at)
      VALUES (1, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    this.db.run(sql, [
      config.host,
      config.port || 3306,
      config.database,
      config.username,
      config.password,
    ]);
    this.save();
    logger.info("MariaDB config set successfully");
  }

  async getMariaDBConfig() {
    await this.ready;
    const sql = "SELECT * FROM mariadb_config WHERE id = 1";
    const stmt = this.db.prepare(sql);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  async setAWSConfig(config) {
    await this.ready;
    const sql = `
      INSERT OR REPLACE INTO aws_config 
      (id, access_key_id, secret_access_key, region, bucket_name, updated_at)
      VALUES (1, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `;
    this.db.run(sql, [
      config.accessKeyId,
      config.secretAccessKey,
      config.region || "us-east-1",
      config.bucketName,
    ]);
    this.save();
    logger.info("AWS config set successfully");
  }

  async getAWSConfig() {
    await this.ready;
    const sql = "SELECT * FROM aws_config WHERE id = 1";
    const stmt = this.db.prepare(sql);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return row;
    }
    stmt.free();
    return null;
  }

  close() {
    // No-op for sql.js, but you can save if needed
    this.save();
  }
}

module.exports = new ConfigService();

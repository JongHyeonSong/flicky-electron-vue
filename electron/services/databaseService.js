const mariadb = require("mariadb");
const { createServiceLogger } = require("../logger");
const configService = require("./configService");

const logger = createServiceLogger("DatabaseService");

class DatabaseService {
  constructor() {
    this.pool = null;
    this.connection = null;
    this.isConnected = false;
  }

  async init() {
    try {
      // Get MariaDB configuration from config service
      let dbConfig = await configService.getMariaDBConfig();

      console.log("wejfio", dbConfig);

      if (!dbConfig) {
        // 기본값을 configService에 저장
        dbConfig = {
          host: "localhost",
          port: 3306,
          database: "video_processing",
          username: "root",
          password: "",
        };
        await configService.setMariaDBConfig(dbConfig);
        logger.warn(
          "MariaDB 설정이 없어 기본값을 configService에 저장하고 사용합니다.",
          dbConfig
        );
      }

      console.log("11 wejfio", dbConfig);

      // Create connection pool
      this.pool = mariadb.createPool({
        host: dbConfig.host,
        port: dbConfig.port || 3306,
        database: dbConfig.database,
        user: dbConfig.username,
        password: dbConfig.password,
        connectionLimit: 5,
        acquireTimeout: 60000,
        timeout: 60000,
        trace: false,
      });

      console.log("1221 wejfio");

      // Test connection
      await this.testConnection();

      console.log("3333 wejfio");

      logger.info("Database service initialized successfully", {
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
      });
    } catch (error) {
      console.error(error);
      logger.error("Failed to initialize database service", {
        error: error.message,
      });
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log("444 wejfio");

      // 5초(5000ms) 타임아웃 내에 커넥션을 얻지 못하면 에러 발생
      this.connection = await Promise.race([
        this.pool.getConnection(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("DB 커넥션 타임아웃(5초)")), 5000)
        ),
      ]);

      console.log("555 wejfio");

      await this.connection.ping();
      this.isConnected = true;

      logger.info("Database connection test successful");

      // Release connection back to pool
      this.connection.release();
      this.connection = null;
    } catch (error) {
      this.isConnected = false;
      logger.error("Database connection test failed", { error: error.message });
      throw error;
    }
  }

  async getConnection() {
    if (!this.pool) {
      throw new Error("Database pool not initialized");
    }

    try {
      const connection = await this.pool.getConnection();
      return connection;
    } catch (error) {
      logger.error("Failed to get database connection", {
        error: error.message,
      });
      throw error;
    }
  }

  async executeQuery(sql, params = []) {
    let connection = null;
    try {
      connection = await this.getConnection();
      const result = await connection.query(sql, params);
      return result;
    } catch (error) {
      logger.error("Query execution failed", {
        sql,
        params,
        error: error.message,
      });
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async executeTransaction(queries) {
    let connection = null;
    try {
      connection = await this.getConnection();
      await connection.beginTransaction();

      const results = [];
      for (const query of queries) {
        const result = await connection.query(query.sql, query.params || []);
        results.push(result);
      }

      await connection.commit();
      return results;
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      logger.error("Transaction failed", { error: error.message });
      throw error;
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      poolSize: this.pool ? this.pool.config.connectionLimit : 0,
      activeConnections: this.pool ? this.pool.activeConnections() : 0,
    };
  }

  async close() {
    try {
      if (this.connection) {
        this.connection.release();
        this.connection = null;
      }

      if (this.pool) {
        await this.pool.end();
        this.pool = null;
      }

      this.isConnected = false;
      logger.info("Database service closed successfully");
    } catch (error) {
      logger.error("Error closing database service", { error: error.message });
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new DatabaseService();

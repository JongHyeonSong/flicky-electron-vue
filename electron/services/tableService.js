const databaseService = require("./databaseService");

class TableService {
  constructor() {
    this.tablesCreated = false;
  }

  async createTables() {
    try {
      // logger.info("Starting table creation..."); // Removed logger

      const createVideoStatusTable = `
        CREATE TABLE IF NOT EXISTS video_processing_status (
          id INT AUTO_INCREMENT PRIMARY KEY,
          filename VARCHAR(255) NOT NULL,
          original_path VARCHAR(500) NOT NULL,
          status ENUM('pending', 'processing', 'encoded', 'uploading', 'completed', 'failed') DEFAULT 'pending',
          encoding_progress INT DEFAULT 0,
          upload_progress INT DEFAULT 0,
          hls_output_path VARCHAR(500),
          file_size BIGINT,
          duration FLOAT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          error_message TEXT,
          INDEX idx_status (status),
          INDEX idx_filename (filename),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      const createUploadLogsTable = `
        CREATE TABLE IF NOT EXISTS upload_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          video_status_id INT,
          upload_type ENUM('original', 'hls') NOT NULL,
          s3_key VARCHAR(500) NOT NULL,
          file_size BIGINT,
          upload_status ENUM('pending', 'uploading', 'completed', 'failed') DEFAULT 'pending',
          progress INT DEFAULT 0,
          started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP NULL,
          error_message TEXT,
          FOREIGN KEY (video_status_id) REFERENCES video_processing_status(id) ON DELETE CASCADE,
          INDEX idx_video_status_id (video_status_id),
          INDEX idx_upload_type (upload_type),
          INDEX idx_upload_status (upload_status),
          INDEX idx_started_at (started_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      const createProcessingLogsTable = `
        CREATE TABLE IF NOT EXISTS processing_logs (
          id INT AUTO_INCREMENT PRIMARY KEY,
          video_status_id INT,
          log_level ENUM('info', 'warning', 'error', 'debug') DEFAULT 'info',
          message TEXT NOT NULL,
          details JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (video_status_id) REFERENCES video_processing_status(id) ON DELETE CASCADE,
          INDEX idx_video_status_id (video_status_id),
          INDEX idx_log_level (log_level),
          INDEX idx_created_at (created_at)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;

      // Execute table creation queries
      await databaseService.executeQuery(createVideoStatusTable);
      // logger.info("Video processing status table created"); // Removed logger

      await databaseService.executeQuery(createUploadLogsTable);
      // logger.info("Upload logs table created"); // Removed logger

      await databaseService.executeQuery(createProcessingLogsTable);
      // logger.info("Processing logs table created"); // Removed logger

      this.tablesCreated = true;
      // logger.info("All tables created successfully"); // Removed logger
    } catch (error) {
      // logger.error("Failed to create tables", { error: error.message }); // Removed logger
      throw error;
    }
  }

  async checkTablesExist() {
    try {
      const tables = [
        "video_processing_status",
        "upload_logs",
        "processing_logs",
      ];
      const existingTables = [];

      for (const table of tables) {
        const result = await databaseService.executeQuery(
          "SHOW TABLES LIKE ?",
          [table]
        );
        if (result.length > 0) {
          existingTables.push(table);
        }
      }

      return {
        exists: existingTables.length === tables.length,
        existingTables,
        missingTables: tables.filter(
          (table) => !existingTables.includes(table)
        ),
      };
    } catch (error) {
      // logger.error("Failed to check table existence", { error: error.message }); // Removed logger
      throw error;
    }
  }

  async getTableInfo() {
    try {
      const tables = [
        "video_processing_status",
        "upload_logs",
        "processing_logs",
      ];
      const tableInfo = {};

      for (const table of tables) {
        const result = await databaseService.executeQuery(
          "SELECT COUNT(*) as count FROM ??",
          [table]
        );
        tableInfo[table] = {
          recordCount: result[0]?.count || 0,
        };
      }

      return tableInfo;
    } catch (error) {
      // logger.error("Failed to get table info", { error: error.message }); // Removed logger
      throw error;
    }
  }

  async dropTables() {
    try {
      // logger.warn("Dropping all tables..."); // Removed logger

      const dropQueries = [
        "DROP TABLE IF EXISTS processing_logs",
        "DROP TABLE IF EXISTS upload_logs",
        "DROP TABLE IF EXISTS video_processing_status",
      ];

      for (const query of dropQueries) {
        await databaseService.executeQuery(query);
      }

      this.tablesCreated = false;
      // logger.info("All tables dropped successfully"); // Removed logger
    } catch (error) {
      // logger.error("Failed to drop tables", { error: error.message }); // Removed logger
      throw error;
    }
  }

  async resetTables() {
    try {
      // logger.info("Resetting all tables..."); // Removed logger
      await this.dropTables();
      await this.createTables();
      // logger.info("Tables reset successfully"); // Removed logger
    } catch (error) {
      // logger.error("Failed to reset tables", { error: error.message }); // Removed logger
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new TableService();

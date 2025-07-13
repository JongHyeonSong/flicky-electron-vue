const databaseService = require("./databaseService");

class QueryService {
  constructor() {
    // Video processing status queries
    this.videoStatusQueries = {
      insert: `
        INSERT INTO video_processing_status 
        (filename, original_path, status, file_size, duration) 
        VALUES (?, ?, ?, ?, ?)
      `,

      updateStatus: `
        UPDATE video_processing_status 
        SET status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      updateProgress: `
        UPDATE video_processing_status 
        SET encoding_progress = ?, upload_progress = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      updateHLSOutput: `
        UPDATE video_processing_status 
        SET hls_output_path = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      updateError: `
        UPDATE video_processing_status 
        SET status = 'failed', error_message = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      getById: `
        SELECT * FROM video_processing_status WHERE id = ?
      `,

      getByStatus: `
        SELECT * FROM video_processing_status 
        WHERE status = ? 
        ORDER BY created_at DESC
      `,

      getAll: `
        SELECT * FROM video_processing_status 
        ORDER BY created_at DESC
      `,

      getRecent: `
        SELECT * FROM video_processing_status 
        ORDER BY created_at DESC 
        LIMIT ?
      `,

      deleteById: `
        DELETE FROM video_processing_status WHERE id = ?
      `,
    };

    // Upload logs queries
    this.uploadLogsQueries = {
      insert: `
        INSERT INTO upload_logs 
        (video_status_id, upload_type, s3_key, file_size, upload_status) 
        VALUES (?, ?, ?, ?, ?)
      `,

      updateProgress: `
        UPDATE upload_logs 
        SET progress = ?, upload_status = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      completeUpload: `
        UPDATE upload_logs 
        SET upload_status = 'completed', progress = 100, completed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      failUpload: `
        UPDATE upload_logs 
        SET upload_status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `,

      getByVideoId: `
        SELECT * FROM upload_logs 
        WHERE video_status_id = ? 
        ORDER BY started_at DESC
      `,

      getByType: `
        SELECT * FROM upload_logs 
        WHERE upload_type = ? 
        ORDER BY started_at DESC
      `,
    };

    // Processing logs queries
    this.processingLogsQueries = {
      insert: `
        INSERT INTO processing_logs 
        (video_status_id, log_level, message, details) 
        VALUES (?, ?, ?, ?)
      `,

      getByVideoId: `
        SELECT * FROM processing_logs 
        WHERE video_status_id = ? 
        ORDER BY created_at DESC
      `,

      getByLevel: `
        SELECT * FROM processing_logs 
        WHERE log_level = ? 
        ORDER BY created_at DESC
      `,

      getRecent: `
        SELECT pl.*, vps.filename 
        FROM processing_logs pl
        JOIN video_processing_status vps ON pl.video_status_id = vps.id
        ORDER BY pl.created_at DESC 
        LIMIT ?
      `,
    };
  }

  // Video processing status methods
  async createVideoStatus(videoData) {
    try {
      const result = await databaseService.executeQuery(
        this.videoStatusQueries.insert,
        [
          videoData.filename,
          videoData.originalPath,
          videoData.status || "pending",
          videoData.fileSize || null,
          videoData.duration || null,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async updateVideoStatus(id, status) {
    try {
      await databaseService.executeQuery(this.videoStatusQueries.updateStatus, [
        status,
        id,
      ]);
    } catch (error) {
      throw error;
    }
  }

  async updateVideoProgress(id, encodingProgress, uploadProgress) {
    try {
      await databaseService.executeQuery(
        this.videoStatusQueries.updateProgress,
        [encodingProgress, uploadProgress, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async updateVideoError(id, errorMessage) {
    try {
      await databaseService.executeQuery(this.videoStatusQueries.updateError, [
        errorMessage,
        id,
      ]);
    } catch (error) {
      throw error;
    }
  }

  async getVideoStatus(id) {
    try {
      const result = await databaseService.executeQuery(
        this.videoStatusQueries.getById,
        [id]
      );

      return result[0] || null;
    } catch (error) {
      throw error;
    }
  }

  async getVideosByStatus(status) {
    try {
      const result = await databaseService.executeQuery(
        this.videoStatusQueries.getByStatus,
        [status]
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  async getAllVideos() {
    try {
      const result = await databaseService.executeQuery(
        this.videoStatusQueries.getAll
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Upload logs methods
  async createUploadLog(uploadData) {
    try {
      const result = await databaseService.executeQuery(
        this.uploadLogsQueries.insert,
        [
          uploadData.videoStatusId,
          uploadData.uploadType,
          uploadData.s3Key,
          uploadData.fileSize || null,
          uploadData.uploadStatus || "pending",
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async updateUploadProgress(id, progress, status) {
    try {
      await databaseService.executeQuery(
        this.uploadLogsQueries.updateProgress,
        [progress, status, id]
      );
    } catch (error) {
      throw error;
    }
  }

  async completeUpload(id) {
    try {
      await databaseService.executeQuery(
        this.uploadLogsQueries.completeUpload,
        [id]
      );
    } catch (error) {
      throw error;
    }
  }

  // Processing logs methods
  async createProcessingLog(logData) {
    try {
      const result = await databaseService.executeQuery(
        this.processingLogsQueries.insert,
        [
          logData.videoStatusId,
          logData.logLevel || "info",
          logData.message,
          logData.details ? JSON.stringify(logData.details) : null,
        ]
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  async getProcessingLogsByVideo(videoStatusId) {
    try {
      const result = await databaseService.executeQuery(
        this.processingLogsQueries.getByVideoId,
        [videoStatusId]
      );

      return result;
    } catch (error) {
      throw error;
    }
  }

  // Statistics methods
  async getStatistics() {
    try {
      const stats = {};

      // Get video status counts
      const statusCounts = await databaseService.executeQuery(`
        SELECT status, COUNT(*) as count 
        FROM video_processing_status 
        GROUP BY status
      `);

      stats.statusCounts = statusCounts;

      // Get upload status counts
      const uploadCounts = await databaseService.executeQuery(`
        SELECT upload_status, COUNT(*) as count 
        FROM upload_logs 
        GROUP BY upload_status
      `);

      stats.uploadCounts = uploadCounts;

      // Get total file size
      const totalSize = await databaseService.executeQuery(`
        SELECT SUM(file_size) as total_size 
        FROM video_processing_status 
        WHERE status = 'completed'
      `);

      stats.totalSize = totalSize[0]?.total_size || 0;

      return stats;
    } catch (error) {
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new QueryService();

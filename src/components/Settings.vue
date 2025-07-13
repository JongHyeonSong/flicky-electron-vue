<template>
  <div class="settings-container">
    <div class="settings-header">
      <h2>⚙️ 설정</h2>
      <p>애플리케이션 설정을 관리합니다.</p>
    </div>

    <!-- Debug info -->
    <div
      class="debug-info"
      style="
        background: rgba(255, 255, 255, 0.1);
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
      "
    >
      <p>
        Debug: electronAPI =
        {{ electronApiAvailable ? "Available" : "Not Available" }}
      </p>
      <p>Debug: isLoading = {{ isLoading }}</p>
      <p>Debug: activeTab = {{ activeTab }}</p>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
    </div>

    <div class="settings-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
        @click="activeTab = tab.id"
      >
        <span class="tab-icon">{{ tab.icon }}</span>
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>

    <div class="settings-content">
      <div v-if="activeTab === 'database'" class="config-section">
        <h3>🗄️ MariaDB 설정</h3>
        <p>데이터베이스 연결 정보를 입력하세요.</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="db-host">호스트</label>
            <input
              id="db-host"
              type="text"
              v-model="mariaDBConfig.host"
              placeholder="localhost"
            />
          </div>

          <div class="form-group">
            <label for="db-port">포트</label>
            <input
              id="db-port"
              type="number"
              v-model="mariaDBConfig.port"
              placeholder="3306"
            />
          </div>

          <div class="form-group">
            <label for="db-database">데이터베이스명</label>
            <input
              id="db-database"
              type="text"
              v-model="mariaDBConfig.database"
              placeholder="video_processing"
            />
          </div>

          <div class="form-group">
            <label for="db-username">사용자명</label>
            <input
              id="db-username"
              type="text"
              v-model="mariaDBConfig.username"
              placeholder="root"
            />
          </div>

          <div class="form-group">
            <label for="db-password">비밀번호</label>
            <input
              id="db-password"
              type="password"
              v-model="mariaDBConfig.password"
              placeholder="비밀번호를 입력하세요"
            />
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn btn-secondary"
            @click="testDBConnection"
          >
          연결 테스트
            <!-- {{ isLoading ? "테스트 중..." : "연결 테스트" }} -->
          </button>
          <button
            class="btn btn-primary"
            @click="saveMariaDBConfig"
            :disabled="!validateMariaDB() || isLoading"
          >
            {{ isLoading ? "저장 중..." : "저장" }}
          </button>
        </div>
        <div v-if="dbTestStatus === 'connected'" style="color:green;">✅ 연결됨</div>
        <div v-else-if="dbTestStatus === 'not_connected'" style="color:red;">❌ 연결 실패</div>
        <div v-if="dbTestMessage">{{ dbTestMessage }}</div>
      </div>

      <div v-else-if="activeTab === 'aws'" class="config-section">
        <h3>☁️ AWS S3 설정</h3>
        <p>AWS S3 업로드를 위한 설정을 입력하세요.</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="aws-access-key">Access Key ID</label>
            <input
              id="aws-access-key"
              type="text"
              v-model="awsConfig.accessKeyId"
              placeholder="AKIA..."
            />
          </div>

          <div class="form-group">
            <label for="aws-secret-key">Secret Access Key</label>
            <input
              id="aws-secret-key"
              type="password"
              v-model="awsConfig.secretAccessKey"
              placeholder="비밀 키를 입력하세요"
            />
          </div>

          <div class="form-group">
            <label for="aws-region">리전</label>
            <select id="aws-region" v-model="awsConfig.region">
              <option v-for="region in regions" :key="region" :value="region">
                {{ region }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="aws-bucket">버킷명</label>
            <input
              id="aws-bucket"
              type="text"
              v-model="awsConfig.bucketName"
              placeholder="my-video-bucket"
            />
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn btn-primary"
            @click="saveAWSConfig"
            :disabled="!validateAWS() || isLoading"
          >
            {{ isLoading ? "저장 중..." : "저장" }}
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'general'" class="config-section">
        <h3>⚙️ 일반 설정</h3>
        <p>애플리케이션의 일반적인 설정을 관리합니다.</p>

        <div class="form-grid">
          <div class="form-group">
            <label for="target-folder">대상 폴더</label>
            <div class="folder-input">
              <input
                id="target-folder"
                type="text"
                v-model="generalConfig.targetFolder"
                placeholder="MP4 파일이 있는 폴더를 선택하세요"
                readonly
              />
              <button class="btn btn-secondary" @click="selectTargetFolder">
                폴더 선택
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="log-level">로그 레벨</label>
            <select id="log-level" v-model="generalConfig.logLevel">
              <option
                v-for="level in logLevels"
                :key="level.value"
                :value="level.value"
              >
                {{ level.label }}
              </option>
            </select>
          </div>
        </div>

        <div class="button-group">
          <button
            class="btn btn-primary"
            @click="saveGeneralConfig"
            :disabled="isLoading"
          >
            {{ isLoading ? "저장 중..." : "저장" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { electronBridge } from '../utils/electronBridge';
export default {
  name: "Settings",
  data() {
    return {
      electronApiAvailable: false,
      // Form data
      mariaDBConfig: {
        host: "",
        port: 3306,
        database: "",
        username: "",
        password: "",
      },
      awsConfig: {
        accessKeyId: "",
        secretAccessKey: "",
        region: "us-east-1",
        bucketName: "",
      },
      generalConfig: {
        targetFolder: "",
        logLevel: "info",
      },
      // UI state
      activeTab: "database",
      isLoading: false,
      message: "",
      messageType: "info",
      tabs: [
        { id: "database", label: "데이터베이스", icon: "🗄️" },
        { id: "aws", label: "AWS S3", icon: "☁️" },
        { id: "general", label: "일반", icon: "⚙️" },
      ],
      regions: [
        "us-east-1",
        "us-east-2",
        "us-west-1",
        "us-west-2",
        "ap-northeast-1",
        "ap-northeast-2",
        "ap-southeast-1",
        "ap-southeast-2",
        "eu-west-1",
        "eu-central-1",
        "sa-east-1",
      ],
      logLevels: [
        { value: "error", label: "에러만" },
        { value: "warn", label: "경고 이상" },
        { value: "info", label: "정보 이상" },
        { value: "debug", label: "디버그 이상" },
      ],
      dbTestStatus: null,
      dbTestMessage: ''
    };
  },
  async mounted() {
    this.electronApiAvailable = typeof window !== 'undefined' && !!window.electronAPI;
    await this.loadConfigurations();
  },
  methods: {
    async loadConfigurations() {

      this.isLoading = true;
      try {

        // Electron 환경 전제: 바로 API 사용
        const dbConfig = await window.electronAPI.getMariaDBConfig();
        if (dbConfig) {
          this.mariaDBConfig = { ...this.mariaDBConfig, ...dbConfig };
        }
        const awsData = await window.electronAPI.getAWSConfig();
        if (awsData) {
          this.awsConfig = { ...this.awsConfig, ...awsData };
        }
        const targetFolder = await window.electronAPI.getConfig("targetFolder");
        const logLevel = await window.electronAPI.getConfig("logLevel");
        this.generalConfig.targetFolder = targetFolder || "";
        this.generalConfig.logLevel = logLevel || "info";
      } catch (error) {
        this.showMessage("설정을 불러오는 중 오류가 발생했습니다.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async saveMariaDBConfig() {
      this.isLoading = true;
      try {
        await window.electronAPI.setMariaDBConfig(this.mariaDBConfig);
        this.showMessage("MariaDB 설정이 저장되었습니다.", "success");
      } catch (error) {
        this.showMessage("MariaDB 설정 저장 중 오류가 발생했습니다.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async saveAWSConfig() {
      this.isLoading = true;
      try {
        await window.electronAPI.setAWSConfig(this.awsConfig);
        this.showMessage("AWS 설정이 저장되었습니다.", "success");
      } catch (error) {
        this.showMessage("AWS 설정 저장 중 오류가 발생했습니다.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async saveGeneralConfig() {
      this.isLoading = true;
      try {
        await window.electronAPI.setConfig(
          "targetFolder",
          this.generalConfig.targetFolder
        );
        await window.electronAPI.setConfig(
          "logLevel",
          this.generalConfig.logLevel
        );
        this.showMessage("일반 설정이 저장되었습니다.", "success");
      } catch (error) {
        this.showMessage("일반 설정 저장 중 오류가 발생했습니다.", "error");
      } finally {
        this.isLoading = false;
      }
    },
    async testDBConnection() {
      this.isLoading = true;
      this.dbTestStatus = null;
      this.dbTestMessage = '';
      try {
        const result = await electronBridge('testDBConnection', this.mariaDBConfig);
        if (result.success) {
          this.dbTestStatus = 'connected';
          this.dbTestMessage = result.message;
        } else {
          this.dbTestStatus = 'not_connected';
          this.dbTestMessage = result.message;
        }
      } catch (e) {
        this.dbTestStatus = 'not_connected';
        this.dbTestMessage = '테스트 중 오류 발생';
      } finally {
        this.isLoading = false;
      }
    },
    async selectTargetFolder() {
      try {
        const result = await window.electronAPI.selectFolder();
        if (result && result.filePaths && result.filePaths.length > 0) {
          this.generalConfig.targetFolder = result.filePaths[0];
        }
      } catch (error) {
        this.showMessage("폴더 선택 중 오류가 발생했습니다.", "error");
      }
    },
    showMessage(text, type) {
      this.message = text;
      this.messageType = type;
      setTimeout(() => {
        this.message = "";
      }, 3000);
    },
    validateMariaDB() {
      return (
        this.mariaDBConfig.host &&
        this.mariaDBConfig.database &&
        this.mariaDBConfig.username &&
        this.mariaDBConfig.password
      );
    },
    validateAWS() {
      return (
        this.awsConfig.accessKeyId &&
        this.awsConfig.secretAccessKey &&
        this.awsConfig.bucketName
      );
    },
  },
};
</script>

<style scoped>
.settings-container {
  max-width: 800px;
  margin: 0 auto;
}

.settings-header {
  text-align: center;
  margin-bottom: 30px;
}

.settings-header h2 {
  color: white;
  font-size: 2rem;
  margin-bottom: 8px;
}

.settings-header p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1rem;
}

.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.message.success {
  background: rgba(46, 213, 115, 0.2);
  color: #2ed573;
  border: 1px solid rgba(46, 213, 115, 0.3);
}

.message.error {
  background: rgba(255, 71, 87, 0.2);
  color: #ff4757;
  border: 1px solid rgba(255, 71, 87, 0.3);
}

.message.info {
  background: rgba(54, 123, 245, 0.2);
  color: #367bf0;
  border: 1px solid rgba(54, 123, 245, 0.3);
}

.settings-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px;
  border-radius: 12px;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.tab-button:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.tab-button.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

.tab-icon {
  font-size: 1.1rem;
}

.settings-content {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 30px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.config-section h3 {
  color: white;
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.config-section p {
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: white;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
}

.form-group input::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.folder-input {
  display: flex;
  gap: 8px;
}

.folder-input input {
  flex: 1;
}

.button-group {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #367bf0;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2d6bd8;
  transform: translateY(-1px);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}
</style>

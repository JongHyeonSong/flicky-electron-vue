<template>
  <main class="app">
    <Header :appVersion="appVersion" />

    <div class="app-content">
      <Sidebar :currentPage="currentPage" @pageChange="handlePageChange" />
      <MainContent :currentPage="currentPage" />
    </div>
  </main>
</template>

<script>
import Header from "./components/Header.vue";
import Sidebar from "./components/Sidebar.vue";
import MainContent from "./components/MainContent.vue";

export default {
  name: "App",
  components: {
    Header,
    Sidebar,
    MainContent,
  },
  data() {
    return {
      appVersion: "1.0.0",
      currentPage: "home",
    };
  },
  async mounted() {
    // Get app version from Electron if available
    if (window.electronAPI) {
      try {
        this.appVersion = await window.electronAPI.getAppVersion();
      } catch (error) {
        console.log("Running in browser mode");
      }
    }
  },
  methods: {
    handlePageChange(page) {
      console.log("App: Page changing from", this.currentPage, "to", page);
      this.currentPage = page;
    },
  },
};
</script>

<style>
.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}

.app-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #555;
}
</style>

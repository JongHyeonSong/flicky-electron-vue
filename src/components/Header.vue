<template>
  <header class="header">
    <div class="header-content">
      <div class="app-title">
        <h1>🚀 Flicky </h1>
        <span class="version">v{{ appVersion }}</span>
      </div>

      <div class="window-controls">
        <button
          class="control-btn minimize"
          @click="handleMinimize"
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="5" width="8" height="2" fill="currentColor" />
          </svg>
        </button>
        <button
          class="control-btn maximize"
          @click="handleMaximize"
          title="Maximize"
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect
              x="2"
              y="2"
              width="8"
              height="8"
              fill="none"
              stroke="currentColor"
              stroke-width="1"
            />
          </svg>
        </button>
        <button class="control-btn close" @click="handleClose" title="Close">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M2 2l8 8M10 2l-8 8"
              stroke="currentColor"
              stroke-width="1.5"
              fill="none"
            />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "Header",
  props: {
    appVersion: {
      type: String,
      default: "1.0.0",
    },
  },
  methods: {
    handleMinimize() {
      if (window.windowControls) {
        window.windowControls.minimize();
      }
    },
    handleMaximize() {
      if (window.windowControls) {
        window.windowControls.maximize();
      }
    },
    handleClose() {
      if (window.windowControls) {
        window.windowControls.close();
      }
    },
  },
};
</script>

<style scoped>
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 0 20px;
  height: 60px;
  display: flex;
  align-items: center;
  -webkit-app-region: drag; /* Makes header draggable on macOS */
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 10px;
  -webkit-app-region: no-drag; /* Allows clicking on title */
}

.app-title h1 {
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.version {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.window-controls {
  display: flex;
  gap: 8px;
  -webkit-app-region: no-drag; /* Allows clicking on controls */
}

.control-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-1px);
}

.control-btn.close:hover {
  background: #ff4757;
}

.control-btn svg {
  pointer-events: none;
}
</style>

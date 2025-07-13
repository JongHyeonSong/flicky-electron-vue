<template>
  <aside class="sidebar">
    <nav class="nav-menu">
      <button
        v-for="item in menuItems"
        :key="item.id"
        :class="['nav-item', { active: currentPage === item.id }]"
        @click="handlePageClick(item.id)"
      >
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-label">{{ item.label }}</span>
      </button>
    </nav>

    <div class="sidebar-footer">
      <div class="status-indicator">
        <span class="status-dot online"></span>
        <span class="status-text">Online</span>
      </div>
    </div>
  </aside>
</template>

<script>
export default {
  name: "Sidebar",
  props: {
    currentPage: {
      type: String,
      default: "home",
    },
  },
  data() {
    return {
      menuItems: [
        { id: "home", label: "🏠 홈", icon: "🏠" },
        { id: "dashboard", label: "📊 대시보드", icon: "📊" },
        { id: "settings", label: "⚙️ 세팅", icon: "⚙️" },
        { id: "about", label: "ℹ️ 정보", icon: "ℹ️" },
      ],
    };
  },
  methods: {
    handlePageClick(pageId) {
      console.log("Sidebar: Page clicked:", pageId);
      this.$emit("pageChange", pageId);
    },
  },
};
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.nav-menu {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  font-weight: 500;
}

.nav-icon {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2ed573;
  animation: pulse 2s infinite;
}

.status-dot.online {
  background: #2ed573;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>

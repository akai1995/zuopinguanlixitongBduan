<template>
  <a-layout-sider
    :collapsed="collapsed"
    :trigger="null"
    collapsible
    :width="220"
    :collapsed-width="64"
    class="app-sidebar"
    :theme="storeState.theme === 'dark' ? 'dark' : 'light'"
  >
    <div class="sidebar-logo" @click="handleNav('/')">
      <svg class="sidebar-logo__icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#1962EC" />
        <path d="M12 26V16L20 12L28 16V26L20 30L12 26Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
        <circle cx="20" cy="21" r="3" fill="white" />
      </svg>
      <span v-show="!collapsed" class="sidebar-logo__text">作品管理系统</span>
    </div>

    <a-menu
      v-model="selectedKeys"
      mode="inline"
      :theme="storeState.theme === 'dark' ? 'dark' : 'light'"
      @click="handleMenuClick"
    >
      <a-menu-item key="/"><a-icon type="dashboard" /><span>首页</span></a-menu-item>
      <a-menu-item key="/works"><a-icon type="picture" /><span>个人作品</span></a-menu-item>
      <a-menu-item key="/ai-images"><a-icon type="experiment" /><span>AI生图</span></a-menu-item>
    </a-menu>

    <div class="sidebar-toggle" @click="$emit('toggle')">
      <a-icon :type="collapsed ? 'menu-unfold' : 'menu-fold'" />
    </div>
  </a-layout-sider>
</template>

<script>
import themeStore from '@/store/theme'

export default {
  name: 'AppSidebar',
  props: {
    collapsed: { type: Boolean, default: false },
  },
  data() {
    return {
      selectedKeys: [this.$route?.path || '/'],
      storeState: themeStore.useState(),
    }
  },
  watch: {
    '$route.path'(val) {
      this.selectedKeys = [val]
    },
  },
  methods: {
    handleMenuClick({ key }) {
      this.$router.push(key)
    },
    handleNav(path) {
      if (this.$route.path === path) return
      this.$router.push(path)
    },
  },
}
</script>

<style scoped>
.app-sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: 1px 0 4px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border-secondary);
}
[data-theme='dark'] .app-sidebar { box-shadow: 1px 0 4px rgba(0, 0, 0, 0.3); }
.sidebar-logo {
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  cursor: pointer;
  gap: 12px;
  border-bottom: 1px solid var(--border-secondary);
  flex-shrink: 0;
}
.sidebar-logo__icon { width: 32px; height: 32px; flex-shrink: 0; }
.sidebar-logo__text {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  white-space: nowrap;
}
.sidebar-toggle {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-top: 1px solid var(--border-secondary);
  color: var(--text-auxiliary);
  font-size: 16px;
  transition: color var(--transition-fast);
  flex-shrink: 0;
  margin-top: auto;
}
.sidebar-toggle:hover { color: var(--color-primary); }
</style>
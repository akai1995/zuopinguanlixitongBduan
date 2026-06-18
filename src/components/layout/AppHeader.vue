<template>
  <a-layout-header class="app-header">
    <div class="app-header__left">
      <div class="app-header__logo" @click="handleNav('/')">
        <svg class="app-header__logo-icon" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="40" height="40" rx="8" fill="#1962EC" />
          <path d="M12 26V16L20 12L28 16V26L20 30L12 26Z" stroke="white" stroke-width="2" stroke-linejoin="round" />
          <circle cx="20" cy="21" r="3" fill="white" />
        </svg>
        <span class="app-header__logo-text">作品管理系统</span>
      </div>
    </div>
    <div class="app-header__center">
      <a-menu
        v-model="selectedKeys"
        mode="horizontal"
        :theme="theme"
        class="app-header__nav"
        @click="handleMenuClick"
      >
        <a-menu-item key="/"><span>首页</span></a-menu-item>
        <a-menu-item key="/works"><span>个人作品</span></a-menu-item>
        <a-menu-item key="/ai-images"><span>AI生图</span></a-menu-item>
      </a-menu>
    </div>
    <div class="app-header__right">
      <ThemeSwitch />
      <a-dropdown>
        <div class="user-avatar">
          <a-avatar :size="32" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20headshot%20portrait%20asian%20male%20designer%20minimal%20clean&image_size=square_hd" />
        </div>
        <a-menu slot="overlay" class="user-avatar-dropdown-menu">
          <a-menu-item key="profile"><a-icon type="user" />个人信息</a-menu-item>
          <a-menu-divider />
          <a-menu-item key="logout"><a-icon type="logout" />退出登录</a-menu-item>
        </a-menu>
      </a-dropdown>
    </div>
  </a-layout-header>
</template>

<script>
import themeStore from '@/store/theme'
import ThemeSwitch from '@/components/ThemeSwitch'

export default {
  name: 'AppHeader',
  components: {
    ThemeSwitch,
  },
  data() {
    return {
      selectedKeys: [this.$route?.path || '/'],
      storeState: themeStore.useState(),
    }
  },
  computed: {
    theme() {
      return this.storeState.theme
    },
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
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  line-height: 56px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  background: var(--bg-card) !important;
  border-bottom: 1px solid var(--border-secondary);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}
[data-theme='dark'] .app-header { box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3); }
.app-header__left { flex: 1; display: flex; align-items: center; }
.app-header__center { flex: 0 0 auto; display: flex; align-items: center; justify-content: center; }
.app-header__right { flex: 1; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
.app-header__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  flex-shrink: 0;
}
.app-header__logo-icon { width: 32px; height: 32px; }
.app-header__logo-text {
  font-size: var(--font-size-h2);
  font-weight: var(--font-weight-medium);
  color: var(--text-title);
  white-space: nowrap;
}
@media (max-width: 768px) {
  .app-header__logo-text {
    display: none;
  }
}
.app-header__nav {
  line-height: 54px;
  border-bottom: none !important;
  background-color: transparent !important;
  display: flex;
  align-items: center;
  box-shadow: none !important;
}
.app-header__nav::after {
  display: none !important;
}
.app-header__nav .ant-menu-item {
  height: 32px;
  line-height: 32px;
  padding: 0 16px;
  margin: 0 4px;
  border-radius: 16px;
  background: var(--bg-control);
  transition: all var(--transition-fast);
}
.app-header__nav .ant-menu-item,
.app-header__nav .ant-menu-item > a,
.app-header__nav .ant-menu-item > a > span {
  color: var(--text-secondary) !important;
}
.app-header__nav .ant-menu-item:hover {
  color: var(--color-primary) !important;
  background: var(--bg-control-secondary);
  border-bottom: none !important;
}
.app-header__nav .ant-menu-item:hover > a,
.app-header__nav .ant-menu-item:hover > a > span {
  color: var(--color-primary) !important;
}

.app-header__nav .ant-menu-item-selected {
  background: var(--color-primary) !important;
}
.app-header__nav .ant-menu-item-selected,
.app-header__nav .ant-menu-item-selected > a,
.app-header__nav .ant-menu-item-selected > a > span,
.app-header__nav .ant-menu-item-selected:hover,
.app-header__nav .ant-menu-item-selected:hover > a,
.app-header__nav .ant-menu-item-selected:hover > a > span {
  color: #ffffff !important;
}
.user-avatar {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0;
  border-radius: 4px;
  transition: background var(--transition-fast);
}
.user-avatar:hover { background: var(--bg-control-secondary); }
</style>

<style>
/* 头像下拉菜单主题适配 */
.user-avatar-dropdown-menu {
  background: var(--bg-card) !important;
  border: 1px solid var(--border-primary) !important;
  border-radius: var(--radius-button) !important;
  box-shadow: var(--shadow-modal) !important;
  padding: 4px 0 !important;
}
.user-avatar-dropdown-menu .ant-dropdown-menu-item {
  color: var(--text-primary) !important;
  padding: 8px 16px !important;
  margin: 0 !important;
  border-radius: 4px !important;
  transition: all var(--transition-fast) !important;
}
.user-avatar-dropdown-menu .ant-dropdown-menu-item:hover {
  background: var(--bg-control-secondary) !important;
  color: var(--color-primary) !important;
}
.user-avatar-dropdown-menu .ant-dropdown-menu-item .anticon {
  color: var(--text-secondary) !important;
  margin-right: 8px !important;
}
.user-avatar-dropdown-menu .ant-dropdown-menu-item:hover .anticon {
  color: var(--color-primary) !important;
}
.user-avatar-dropdown-menu .ant-dropdown-menu-item-divider {
  background: var(--border-secondary) !important;
  margin: 4px 0 !important;
}
</style>
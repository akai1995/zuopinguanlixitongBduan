<template>
  <a-layout class="app-layout">
    <AppHeader />
    <a-layout-content class="app-layout__content">
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script>
import AppHeader from './AppHeader.vue'

export default {
  name: 'AppLayout',
  components: { AppHeader },
  watch: {
    '$route'() {
      this.$nextTick(() => {
        const contentEl = this.$el.querySelector('.app-layout__content')
        if (contentEl) {
          contentEl.scrollTop = 0
        }
      })
    },
  },
}
</script>

<style scoped>
.app-layout { height: 100vh; background: var(--bg-global); display: flex; flex-direction: column; overflow: hidden; }
.app-layout__content { 
  flex: 1; 
  background: var(--bg-global); 
  padding: 88px 24px 24px; 
  overflow-y: auto; 
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}
@media (max-width: 768px) {
  .app-layout__content {
    padding: 88px 12px 16px;
  }
}
@media (min-width: 769px) and (max-width: 1024px) {
  .app-layout__content {
    padding: 88px 16px 20px;
  }
}
</style>
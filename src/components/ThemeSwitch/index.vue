<template>
  <button
    type="button"
    class="theme-switch"
    :class="{ 'theme-switch--dark': isDark }"
    :disabled="disabled"
    :title="isDark ? '切换到亮色模式' : '切换到暗色模式'"
    @click="handleToggle"
  >
    <span class="theme-switch__icon-wrapper">
      <!-- 太阳图标 -->
      <svg
        class="theme-switch__icon theme-switch__icon--sun"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="5"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <!-- 月亮图标 -->
      <svg
        class="theme-switch__icon theme-switch__icon--moon"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </span>
  </button>
</template>

<script>
/**
 * ThemeSwitch 主题切换按钮组件
 * @description 支持明暗主题切换，带圆形扩散波纹动画和图标旋转过渡
 */
import themeStore from '@/store/theme'

export default {
  name: 'ThemeSwitch',
  props: {
    /** 是否禁用 */
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      storeState: themeStore.useState(),
      isAnimating: false,
    }
  },
  computed: {
    isDark() {
      return this.storeState.theme === 'dark'
    },
  },
  methods: {
    /**
     * 计算容器最大扩散半径
     * @param {HTMLElement} container - 点击的容器元素
     * @param {number} clickX - 点击的 X 坐标
     * @param {number} clickY - 点击的 Y 坐标
     * @returns {number} 最大扩散半径（像素）
     */
    calculateMaxRadius(container, clickX, clickY) {
      const rect = container.getBoundingClientRect()
      const distances = [
        Math.hypot(clickX - rect.left, clickY - rect.top),
        Math.hypot(clickX - rect.right, clickY - rect.top),
        Math.hypot(clickX - rect.left, clickY - rect.bottom),
        Math.hypot(clickX - rect.right, clickY - rect.bottom),
      ]
      return Math.max(...distances)
    },

    /**
     * 创建圆形扩散波纹动画
     * @param {MouseEvent} event - 点击事件
     */
    createRippleEffect(event) {
      const container = event.currentTarget
      if (!container) return

      const clickX = event.clientX
      const clickY = event.clientY
      const maxRadius = this.calculateMaxRadius(container, clickX, clickY)

      // 创建波纹元素 - 使用 div 直接作为波纹圆
      const ripple = document.createElement('div')
      ripple.className = 'theme-ripple'
      const size = maxRadius * 2.5
      ripple.style.cssText = `
        position: fixed;
        left: ${clickX}px;
        top: ${clickY}px;
        width: ${size}px;
        height: ${size}px;
        margin-left: -${size / 2}px;
        margin-top: -${size / 2}px;
        border-radius: 50%;
        background: ${this.isDark ? 'rgba(247, 247, 247, 0.12)' : 'rgba(8, 8, 8, 0.08)'};
        opacity: 0.6;
        transform: scale(0);
        z-index: 9999;
        pointer-events: none;
        transition: transform 600ms cubic-bezier(0.4, 0, 0.2, 1), opacity 600ms cubic-bezier(0.4, 0, 0.2, 1);
      `

      document.body.appendChild(ripple)

      // 强制重排后触发动画
      ripple.offsetHeight
      ripple.style.transform = 'scale(1)'
      ripple.style.opacity = '0'

      // 动画结束后切换主题并清理
      const handleTransitionEnd = () => {
        themeStore.getState().toggleTheme()
        this.$emit('change', !this.isDark)
        ripple.removeEventListener('transitionend', handleTransitionEnd)
        ripple.remove()
        this.isAnimating = false
      }

      ripple.addEventListener('transitionend', handleTransitionEnd)
    },

    /**
     * 处理主题切换点击
     * @param {MouseEvent} event - 点击事件
     */
    handleToggle(event) {
      if (this.disabled || this.isAnimating) return

      this.isAnimating = true
      this.createRippleEffect(event)
    },
  },
}
</script>

<style lang="scss" scoped>
// ========== 变量定义 ==========
$theme-switch-size: 32px;
$theme-switch-icon-size: 18px;
$theme-switch-border-radius: 50%;
$theme-switch-transition-duration: 0.35s;

// 颜色变量（从 CSS 变量读取）
$color-text-secondary: var(--text-secondary);
$color-border-primary: var(--border-primary);
$color-bg-control-secondary: var(--bg-control-secondary);

// ========== 组件样式 ==========
.theme-switch {
  position: relative;
  width: $theme-switch-size;
  height: $theme-switch-size;
  border-radius: $theme-switch-border-radius;
  border: 1px solid $color-border-primary;
  background: transparent;
  color: $color-text-secondary;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;
  transition: all $theme-switch-transition-duration cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  -webkit-tap-highlight-color: transparent;

  // 悬浮状态
  &:hover:not(:disabled) {
    background: $color-bg-control-secondary;
    border-color: $color-border-primary;
  }

  // 聚焦状态
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--color-primary-hover);
  }

  // 禁用状态
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // 图标容器
  &__icon-wrapper {
    position: relative;
    width: $theme-switch-icon-size;
    height: $theme-switch-icon-size;
    display: block;
  }

  // 图标通用样式
  &__icon {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: all $theme-switch-transition-duration cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform, opacity;
  }

  // 太阳图标 - 亮色模式显示
  &__icon--sun {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }

  // 月亮图标 - 默认隐藏
  &__icon--moon {
    opacity: 0;
    transform: scale(0.8) rotate(90deg);
  }

  // 暗色模式状态
  &--dark {
    .theme-switch__icon--sun {
      opacity: 0;
      transform: scale(0.8) rotate(-90deg);
    }

    .theme-switch__icon--moon {
      opacity: 1;
      transform: scale(1) rotate(0deg);
    }
  }
}
</style>

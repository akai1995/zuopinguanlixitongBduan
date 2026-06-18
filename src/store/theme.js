import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createReactiveStore } from '@/utils/reactiveStore'

const useThemeStore = create((set) => ({
  theme: 'light',

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', newTheme)
      return { theme: newTheme }
    })
  },

  setTheme: (theme) => {
    document.documentElement.setAttribute('data-theme', theme)
    set({ theme })
  },
}))

export default createReactiveStore(useThemeStore)
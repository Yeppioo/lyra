import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export interface SettingsState {
  theme: 'light' | 'dark'
  volume: number
  userinfo: {
    username: string
    avatar: string
    usernameLabel: string
  }
}

const defaultSettings: SettingsState = {
  theme: 'light',
  volume: 0.8,
  userinfo: {
    username: '未登录',
    usernameLabel: '登录使用完整功能',
    avatar: '',
  },
}

export const useSettingsStore = defineStore('settings', () => {
  const loadedSettings = JSON.parse(localStorage.getItem('settings') || '{}')
  if (loadedSettings.theme === 'auto') {
    loadedSettings.theme = 'light'
  }
  const settings = ref<SettingsState>({ ...defaultSettings, ...loadedSettings })

  watch(
    settings,
    (newSettings) => {
      localStorage.setItem('settings', JSON.stringify(newSettings))
    },
    { deep: true },
  )

  watch(
    () => settings.value.theme,
    (theme) => {
      if (theme === 'dark') {
        document.documentElement.setAttribute('theme-dark', '')
      } else {
        document.documentElement.removeAttribute('theme-dark')
      }
    },
    { immediate: true },
  )

  return {
    settings,
  }
})

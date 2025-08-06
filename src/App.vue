<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { ConfigProvider, theme as aTheme } from 'ant-design-vue'
import { useSettingsStore } from '@/stores/settings'
import NavBar from './components/NavBar.vue'

const settingsStore = useSettingsStore()
const theme = computed(() => {
  return settingsStore.settings.theme === 'dark'
    ? {
        algorithm: aTheme.darkAlgorithm,
      }
    : {}
})
</script>

<template>
  <ConfigProvider :theme="theme">
    <NavBar />
    <div id="view">
      <RouterView />
    </div>
  </ConfigProvider>
</template>

<style scoped>
html {
  background: var(--y-bg);
}
#view {
  margin-top: 54px;
}
</style>

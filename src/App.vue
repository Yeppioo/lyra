<script setup lang="ts">
import { computed } from 'vue'; // 移除 ref
import { RouterView } from 'vue-router';
import { ConfigProvider, theme as aTheme } from 'ant-design-vue';
import { useSettingsStore } from '@/stores/settings';
import NavBar from './components/nav/NavBar.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import MusicPlayer from './components/MusicPlayer.vue';
import FullScreenLyrics from './components/FullScreenLyrics.vue'; // 引入 FullScreenLyrics 组件
import { usePlayerStore } from './stores/player';
import { useUIPropertiesStore } from './stores/uiProperties'; // 引入 uiPropertiesStore

const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
const uiPropertiesStore = useUIPropertiesStore(); // 使用 uiPropertiesStore
// 移除 musicPlayerRef
const theme = computed(() => {
  return settingsStore.settings.theme === 'dark'
    ? {
        algorithm: aTheme.darkAlgorithm,
      }
    : {};
});
</script>

<template>
  <ConfigProvider :locale="zhCN" :theme="theme">
    <NavBar />
    <div id="app-view" :class="{ showPlayer: playerStore.currentSong || true }">
      <div id="app-container">
        <RouterView />
      </div>
    </div>
    <MusicPlayer />
    <FullScreenLyrics
      :visible="uiPropertiesStore.uiProperties.showFullScreenLyrics"
      @close="uiPropertiesStore.toggleFullScreenLyrics(false)" />
  </ConfigProvider>
</template>

<style scoped>
html {
  background: var(--y-bg);
}
#app-view {
  overflow-y: scroll;
  overflow-x: hidden;
  height: calc(100vh - 54px);
}
.showPlayer {
  height: calc(100vh - 122px) !important;
  margin-bottom: 70px !important;
}
</style>

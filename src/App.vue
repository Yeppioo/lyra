<script setup lang="ts">
import { computed } from 'vue';
import { RouterView } from 'vue-router';
import { ConfigProvider, theme as aTheme } from 'ant-design-vue';
import { useSettingsStore } from '@/stores/settings';
import NavBar from './components/nav/NavBar.vue';
import zhCN from 'ant-design-vue/es/locale/zh_CN';
import MusicPlayer from './components/MusicPlayer.vue';
import { usePlayerStore } from './stores/player';

const playerStore = usePlayerStore();
const settingsStore = useSettingsStore();
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
    <div id="app-view" :class="{ showPlayer: !playerStore.state.currentSong || true }">
      <RouterView />
    </div>
    <MusicPlayer />
  </ConfigProvider>
</template>

<style scoped>
html {
  background: var(--y-bg);
}
#view {
  margin-top: 54px;
}
.showPlayer {
  margin-bottom: 70px !important;
}
</style>

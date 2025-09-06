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
    <div id="app">
      <NavBar />
      <div id="main-view">
        <RouterView />
      </div>
      <MusicPlayer />
    </div>
  </ConfigProvider>
</template>

<style scoped>
#main-view {
  max-width: 1200px;
  padding: 0 50px !important;
  margin: 0 auto;
  margin-top: 80px;
  overflow-x: scroll;
}
@media (max-width: 930px) {
  #main-view {
    padding: 0 30px !important;
  }
}
@media (max-width: 825px) {
  #main-view {
    padding: 0 20px !important;
  }
}
html {
  background: var(--y-bg);
}
.showPlayer {
  margin-bottom: 70px !important;
}
</style>

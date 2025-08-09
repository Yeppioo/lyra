<template>
  <div v-if="playerStore.state.currentSong || true" class="control-container">
    <div class="progress">
      <span class="progress-text current-time">
        {{ formatSecondsToMinutes(playerStore.state.currentTime) }}
      </span>
      <a-slider
        :tooltipOpen="false"
        id="progress-slider"
        v-model:value="playerStore.state.currentTime"
        :max="playerStore.state.duration"
        :step="1"
        :tip-formatter="formatSecondsToMinutes" />
      <span class="progress-text current-time">
        {{ formatSecondsToMinutes(playerStore.state.duration) }}
      </span>
    </div>
    <div class="main-section">
      <div class="info">
        <a-image
          :fallback="fallbackImg"
          :placeholder="true"
          class="icon-img"
          :width="48"
          :height="48"
          :src="playerStore.state.currentSong?.cover">
        </a-image>
      </div>
      <div class="control">
        <font-awesome-icon class="control-button" size="xl" :icon="['fas', 'backward-step']" />
        <font-awesome-icon class="control-button" size="xl" :icon="['fas', 'play']" />
        <font-awesome-icon class="control-button" size="xl" :icon="['fas', 'forward-step']" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { usePlayerStore } from '@/stores/player';
import { fallbackImg } from '@/stores/constant';

const playerStore = usePlayerStore();
const formatSecondsToMinutes = (seconds: number) => {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
</script>

<style>
.control-container {
  display: flex;
  user-select: none;
  flex-direction: column;
  position: fixed;
  align-items: center;
  justify-content: space-between;
  padding: 0 3px;
  width: 100%;
  bottom: 0;
  background: #fff;
}
[theme-dark] .control-container {
  background: #18181c;
}
.progress {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -17px;
}
.icon-img {
  border: 0;
  border-radius: 8px;
}
.progress-text {
  font-size: 12px;
  font-family: var(--y-font);
  color: var(--y-text);
  background: var(--y-com-bg);
  line-height: 1;
  padding: 2px 5px;
  padding-bottom: 3px;
  display: flex;
  border-radius: 91px;
  width: 52px;
  outline: rgb(239, 239, 245) 1px solid;
  align-items: center;
  justify-content: center;
}
#progress-slider {
  width: calc(100% - 130px);
}
.main-section {
  width: 100%;
  padding: 0 5vw;
  height: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding-bottom: 5px;
  margin-top: -4px;
}
.control {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -6px;
}
</style>

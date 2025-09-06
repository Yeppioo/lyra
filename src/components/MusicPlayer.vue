<template>
  <div>
    <audio
      ref="audioRef"
      :src="playerStore.currentSong?.url"
      @ended="onAudioEnded"
      @timeupdate="onTimeUpdate"
      @canplay="onCanPlay"
      style="display: none"></audio>
    <div v-if="playerStore.currentSong" class="control-container">
      <div class="progress">
        <span class="progress-text current-time">
          {{ formatSecondsToMinutes(playerStore.currentSong?.currentTime) }}
        </span>
        <a-slider
          :tooltipOpen="false"
          id="progress-slider"
          :value="currentTime"
          v-model="currentTime"
          :max="playerStore.currentSong?.duration ? playerStore.currentSong.duration / 1000 : 0"
          :step="1"
          :tip-formatter="formatSecondsToMinutes" />
        <span class="progress-text current-time">
          {{ formatSecondsToMinutes(playerStore.currentSong?.duration) }}
        </span>
      </div>
      <div class="main-section">
        <div class="info">
          <a-image
            :preview="false"
            :fallback="fallbackImg"
            :placeholder="true"
            class="icon-img"
            :width="48"
            :height="48"
            :src="playerStore.currentSong?.cover">
          </a-image>
          <div class="info-text">
            <span class="song-name">
              {{ playerStore.currentSong?.name }}
            </span>
            <span class="artist-name">
              {{ playerStore.currentSong?.artist }}
            </span>
          </div>
        </div>
        <div class="control">
          <button class="control-button" @click="playerStore.prev()">
            <font-awesome-icon size="1x" :icon="['fas', 'backward-step']" />
          </button>

          <button class="play-button" @click="togglePlay">
            <i :class="{ 'playing-icon': isPlaying }">
              <svg
                class="play-icon"
                xmlns="http://www.w3.org/2000/svg"
                xmlns:xlink="http://www.w3.org/1999/xlink"
                height="100%"
                viewBox="128 61 829 902"
                width="100%">
                <path
                  d="M224.5,963C211.167,963 198.667,960.5 187,955.5C175.333,950.5 165.083,943.667 156.25,935C147.417,926.333 140.5,916.167 135.5,904.5C130.5,892.833 128,880.333 128,867L128,157C128,143.667 130.5,131.167 135.5,119.5C140.5,107.833 147.333,97.6667 156,89C164.667,80.3334 174.833,73.5001 186.5,68.5C198.167,63.5001 210.667,61.0001 224,61C232,61.0001 240,62.0001 248,64C256,66.0001 263.5,69.0001 270.5,73L907.5,428C922.833,436.667 934.833,448.417 943.5,463.25C952.167,478.083 956.5,494.333 956.5,512C956.5,530 952.25,546.333 943.75,561C935.25,575.667 923.167,587.333 907.5,596L271,951C264,955 256.5,958 248.5,960C240.5,962 232.5,963 224.5,963Z"
                  fill="#ffffff"
                  fill-opacity="1"></path>
              </svg>
              <svg class="pause-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                <path
                  d="M176 96C149.5 96 128 117.5 128 144L128 496C128 522.5 149.5 544 176 544L240 544C266.5 544 288 522.5 288 496L288 144C288 117.5 266.5 96 240 96L176 96zM400 96C373.5 96 352 117.5 352 144L352 496C352 522.5 373.5 544 400 544L464 544C490.5 544 512 522.5 512 496L512 144C512 117.5 490.5 96 464 96L400 96z"
                  fill="#ffffff" />
              </svg>
            </i>
          </button>
          <button class="control-button" @click="playerStore.next()">
            <font-awesome-icon
              size="1x"
              style="position: relative; left: 0.5px"
              :icon="['fas', 'forward-step']" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { fallbackImg } from '@/stores/constant';

const playerStore = usePlayerStore();

const audioRef = ref<HTMLAudioElement | null>(null);
// 页面加载后如果有 currentSong 自动播放
const isPlaying = ref(false);

function playAudio() {
  if (audioRef.value) {
    audioRef.value.play();
  }
}

function pauseAudio() {
  if (audioRef.value) {
    audioRef.value.pause();
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pauseAudio();
  } else {
    playAudio();
  }
}

function onCanPlay() {
  // 可以在这里做自动播放或其他初始化
  playAudio();
}

function onAudioEnded() {
  playerStore.onSongEnded();
}

function onTimeUpdate(e: Event) {
  const audio = e.target as HTMLAudioElement;
  if (playerStore.currentSong) {
    playerStore.currentSong.currentTime = audio.currentTime * 1000;
  }
}

// 切歌时自动播放
watch(
  () => playerStore.currentSong?.url,
  (url) => {
    if (url) {
      playAudio();
    }
  }
);

// 监听 audio 的 play/pause 事件，自动同步 isPlaying
import { onMounted } from 'vue';
onMounted(() => {
  if (audioRef.value) {
    audioRef.value.addEventListener('play', () => {
      isPlaying.value = true;
    });
    audioRef.value.addEventListener('pause', () => {
      isPlaying.value = false;
    });
  }
});

const formatSecondsToMinutes = (seconds: number | undefined) => {
  if (!seconds) return '00:00';
  seconds = seconds / 1000;
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// ...existing code...

const currentTime = ref(0);

// 同步 currentTime <-> currentSong.currentTime
watch(
  () => playerStore.currentSong?.currentTime,
  (val) => {
    if (typeof val === 'number') {
      currentTime.value = val / 1000;
    }
  },
  { immediate: true }
);
watch(currentTime, (val) => {
  if (playerStore.currentSong) {
    playerStore.currentSong.currentTime = val * 1000;
  }
});
</script>

<style scoped>
.info {
  position: relative;
  top: -1px;
  display: flex;
}
.info-text {
  margin-left: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
.info-text span {
  color: var(--y-text);
  font-family: var(--y-font);
  line-height: 1.3;
}
.artist-name {
  margin-top: 2px;
  font-size: 12px;
  color: #909092 !important;
}
.song-name {
  font-size: 15px;
}
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
  background: #242424;
}
.progress {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: -17px;
}
:deep(.icon-img) {
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
[theme-dark] .progress-text {
  outline: rgba(255, 255, 255, 0.09) 1px solid;
}
#progress-slider {
  width: calc(100% - 114px);
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
.play-button {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin: 0 10px;
  padding: 0;
  border: 0;
  background-color: transparent;
}
.play-button i {
  width: 38px;
  height: 38px;
  display: flex;
  background-color: #70baff;
  border-radius: 50%;
}
.play-button:hover i {
  transform: scale(1.1);
}
.pause-icon {
  display: none;
}
.play-button i {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.play-icon {
  width: 13px;
  position: relative;
  left: 1px;
}
.pause-icon {
  width: 21px;
}
.playing-icon .play-icon {
  display: none;
}
.playing-icon .pause-icon {
  display: block;
}
.control-button {
  color: var(--y-text);
  cursor: pointer;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background-color: transparent;
  border-radius: 50%;
}
.control-button:hover {
  background-color: #70baff;
  /* path {
    fill: white;
  } */
}
</style>

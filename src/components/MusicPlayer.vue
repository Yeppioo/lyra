<template>
  <div v-if="visible" class="music-player-bar">
    <div class="player-progress-bar">
      <span class="progress-time">{{ formatTime(currentTime) }}</span>
      <a-slider
        :min="0"
        :max="duration"
        v-model:value="currentTime"
        @change="onSeek"
        class="progress-slider" />
      <span class="progress-time">{{ formatTime(duration) }}</span>
    </div>
    <div class="player-main">
      <div class="player-left">
        <img v-if="coverUrl" :src="coverUrl" class="cover" />
        <div class="song-meta">
          <span class="song-title">{{ currentSong?.name || '未播放' }}</span>
          <span class="artist">{{ currentSong?.artist || '' }}</span>
        </div>
      </div>
      <div class="player-center">
        <a-button shape="circle" @click="prev" :disabled="!canPrev">
          <font-awesome-icon size="lg" :icon="['fas', 'backward']" />
        </a-button>
        <a-button shape="circle" @click="togglePlay">
          <font-awesome-icon size="lg" :icon="isPlaying ? ['fas', 'pause'] : ['fas', 'play']" />
        </a-button>
        <a-button shape="circle" @click="next" :disabled="!canNext">
          <font-awesome-icon size="lg" :icon="['fas', 'forward']" />
        </a-button>
      </div>
      <div class="player-right">
        <a-button shape="circle" @click="toggleMute">
          <font-awesome-icon
            size="lg"
            :icon="muted ? ['fas', 'volume-xmark'] : ['fas', 'volume-high']" />
        </a-button>
        <div
          class="volume-slider-wrap"
          @mouseenter="showVolume = true"
          @mouseleave="onVolumeMouseLeave">
          <transition name="fade">
            <a-slider
              v-if="showVolume"
              :min="0"
              :max="1"
              :step="0.01"
              v-model:value="volume"
              @change="setVolume"
              class="volume-slider" />
          </transition>
        </div>
        <a-dropdown>
          <a-button shape="circle">
            <font-awesome-icon
              size="lg"
              :icon="
                playMode === 'order'
                  ? ['fas', 'arrow-right-arrow-left']
                  : playMode === 'repeat'
                    ? ['fas', 'repeat']
                    : ['fas', 'shuffle']
              " />
          </a-button>
          <template #overlay>
            <a-menu>
              <a-menu-item @click="setPlayMode('order')">
                <font-awesome-icon size="lg" :icon="['fas', 'arrow-right-arrow-left']" /> 顺序播放
              </a-menu-item>
              <a-menu-item @click="setPlayMode('repeat')">
                <font-awesome-icon size="lg" :icon="['fas', 'repeat']" /> 单曲循环
              </a-menu-item>
              <a-menu-item @click="setPlayMode('random')">
                <font-awesome-icon size="lg" :icon="['fas', 'shuffle']" /> 随机播放
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
        <a-button v-if="lyric" @click="showLyric = !showLyric" shape="circle">
          <font-awesome-icon size="lg" :icon="['fas', 'music']" />
        </a-button>
        <a-button shape="circle">
          <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
        </a-button>
      </div>
    </div>
    <div v-if="showLyric && lyric" class="lyric-popup">{{ lyric }}</div>
    <audio
      ref="audioRef"
      :src="audioUrl"
      @ended="onEnded"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata" />
  </div>
</template>
<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
const showVolume = ref(false);
let volumeTimer: any = null;

function onVolumeMouseLeave() {
  if (volumeTimer) clearTimeout(volumeTimer);
  volumeTimer = setTimeout(() => {
    showVolume.value = false;
  }, 600);
}

import { ref, watch, nextTick, onMounted } from 'vue';

interface SongInfo {
  name: string;
  artist: string;
  url: string;
}

const visible = ref(true);
const isPlaying = ref(false);
const audioUrl = ref('');
const currentSong = ref<SongInfo | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);
const currentTime = ref(0);
const duration = ref(0);
const canPrev = ref(false);
const canNext = ref(false);
const volume = ref(1);
const muted = ref(false);
const playMode = ref<'order' | 'repeat' | 'random'>('order');
const showLyric = ref(false);
const coverUrl = ref('');
const lyric = ref('');

const playList = ref<SongInfo[]>([]);
const playIndex = ref(-1);

function setVolume(val: number) {
  volume.value = val;
  if (audioRef.value) audioRef.value.volume = val;
}

function toggleMute() {
  muted.value = !muted.value;
  if (audioRef.value) audioRef.value.muted = muted.value;
}

function setPlayMode(mode: 'order' | 'repeat' | 'random') {
  playMode.value = mode;
}

onMounted(() => {
  if (audioRef.value) {
    setVolume(volume.value);
    audioRef.value.muted = muted.value;
  }
});

function play(
  url: string,
  info?: { name?: string; artist?: string },
  options?: { cover?: string; lyric?: string }
) {
  audioUrl.value = url;
  currentSong.value = {
    name: info?.name || '未知歌曲',
    artist: info?.artist || '',
    url,
  };
  if (options?.cover) coverUrl.value = options.cover;
  if (options?.lyric) lyric.value = options.lyric;
  isPlaying.value = true;
  nextTick(() => {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
      audioRef.value.play();
    }
  });
}

function pause() {
  isPlaying.value = false;
  audioRef.value?.pause();
}

function resume() {
  if (audioUrl.value) {
    isPlaying.value = true;
    audioRef.value?.play();
  }
}

function next() {
  if (playList.value.length > 0 && playIndex.value < playList.value.length - 1) {
    playIndex.value++;
    const song = playList.value[playIndex.value];
    play(song.url, { name: song.name, artist: song.artist });
  }
}

function prev() {
  if (playList.value.length > 0 && playIndex.value > 0) {
    playIndex.value--;
    const song = playList.value[playIndex.value];
    play(song.url, { name: song.name, artist: song.artist });
  }
}

function setPlayList(list: SongInfo[], startIndex = 0) {
  playList.value = list;
  playIndex.value = startIndex;
  if (list.length > 0) {
    play(list[startIndex].url, { name: list[startIndex].name, artist: list[startIndex].artist });
  }
}

function togglePlay() {
  if (isPlaying.value) {
    pause();
  } else {
    resume();
  }
}

function onEnded() {
  if (playMode.value === 'repeat') {
    audioRef.value?.play();
  } else if (playMode.value === 'random' && playList.value.length > 1) {
    let idx = playIndex.value;
    while (playList.value.length > 1 && idx === playIndex.value) {
      idx = Math.floor(Math.random() * playList.value.length);
    }
    playIndex.value = idx;
    const song = playList.value[idx];
    play(song.url, { name: song.name, artist: song.artist });
  } else {
    next();
  }
}

function onTimeUpdate(e: Event) {
  const audio = e.target as HTMLAudioElement;
  currentTime.value = audio.currentTime;
}

function onLoadedMetadata(e: Event) {
  const audio = e.target as HTMLAudioElement;
  duration.value = audio.duration;
  setVolume(volume.value);
  audio.muted = muted.value;
}

function onSeek(val: number) {
  if (audioRef.value) {
    audioRef.value.currentTime = val;
    currentTime.value = val;
  }
}

function formatTime(sec: number) {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, '0');
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, '0');
  return `${m}:${s}`;
}

watch(playIndex, (idx) => {
  canPrev.value = idx > 0;
  canNext.value = playList.value.length > 0 && idx < playList.value.length - 1;
});

// 单例API暴露
export interface MusicPlayerAPI {
  play: typeof play;
  pause: typeof pause;
  resume: typeof resume;
  next: typeof next;
  prev: typeof prev;
  setPlayList: typeof setPlayList;
  togglePlay: typeof togglePlay;
  setVolume: typeof setVolume;
  toggleMute: typeof toggleMute;
  setPlayMode: typeof setPlayMode;
  getCurrentSong: () => SongInfo | null;
  isPlaying: () => boolean;
  getPlayList: () => SongInfo[];
  getPlayIndex: () => number;
  getPlayMode: () => string;
  getVolume: () => number;
  isMuted: () => boolean;
  showLyric: () => void;
}
const playerApi: MusicPlayerAPI = {
  play,
  pause,
  resume,
  next,
  prev,
  setPlayList,
  togglePlay,
  setVolume,
  toggleMute,
  setPlayMode,
  getCurrentSong: () => currentSong.value,
  isPlaying: () => isPlaying.value,
  getPlayList: () => playList.value,
  getPlayIndex: () => playIndex.value,
  getPlayMode: () => playMode.value,
  getVolume: () => volume.value,
  isMuted: () => muted.value,
  showLyric: () => {
    showLyric.value = true;
  },
};
if (typeof window !== 'undefined') {
  (window as unknown as { MusicPlayer: MusicPlayerAPI }).MusicPlayer = playerApi;
}
</script>

<style scoped>
.music-player-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--y-com-bg, #fff);
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0;
  height: auto;
  flex-wrap: nowrap;
}
.player-progress-bar {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 0 24px;
  height: 32px;
  background: var(--y-bg, #f7f7f7);
  border-bottom: 1px solid #eee;
  box-sizing: border-box;
}
.progress-time {
  width: 48px;
  text-align: center;
  font-size: 13px;
  color: #888;
  flex-shrink: 0;
}
.progress-slider {
  flex: 1;
  margin: 0 8px;
}
.player-main {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0 24px 0 24px;
  height: 64px;
  background: var(--y-com-bg, #fff);
}
.player-left {
  display: flex;
  align-items: center;
  min-width: 0;
}
.song-meta {
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  min-width: 0;
}
.player-center {
  display: flex;
  align-items: center;
  gap: 16px;
}
.player-right {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
}
.volume-slider-wrap {
  position: relative;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.volume-slider {
  position: absolute;
  left: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 90px;
  z-index: 10;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 0 8px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.song-title {
  font-weight: bold;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist {
  font-size: 13px;
  color: #888;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.player-progress {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 200px;
  max-width: 320px;
}
.cover {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  margin-right: 12px;
  object-fit: cover;
}
.lyric-popup {
  position: absolute;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: rgba(255, 255, 255, 0.98);
  color: #222;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 16px 24px;
  max-width: 90vw;
  max-height: 40vh;
  overflow-y: auto;
  z-index: 2000;
  font-size: 15px;
  white-space: pre-line;
}
@media (max-width: 600px) {
  .music-player-bar {
    flex-direction: column;
    height: auto;
    padding: 0;
  }
  .player-progress-bar {
    padding: 0 8px;
    height: 28px;
  }
  .player-main {
    padding: 0 8px 0 8px;
    height: auto;
  }
  .player-left {
    min-width: 0;
  }
  .song-meta {
    margin-left: 6px;
  }
  .cover {
    width: 32px;
    height: 32px;
    margin-right: 6px;
  }
  .lyric-popup {
    left: 0;
    right: 0;
    transform: none;
    max-width: 100vw;
  }
}
</style>

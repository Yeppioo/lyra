<template>
  <div v-if="visible" class="music-player-bar">
    <div class="player-controls">
      <a-button shape="circle" @click="prev" :disabled="!canPrev">&#60;</a-button>
      <a-button shape="circle" @click="togglePlay">{{ isPlaying ? '⏸' : '▶️' }}</a-button>
      <a-button shape="circle" @click="next" :disabled="!canNext">&#62;</a-button>
      <a-button shape="circle" @click="toggleMute">{{ muted ? '🔇' : '🔊' }}</a-button>
      <a-slider
        :min="0"
        :max="1"
        :step="0.01"
        v-model:value="volume"
        @change="setVolume"
        style="width: 60px; margin-left: 8px" />
      <a-dropdown>
        <a-button shape="circle">{{
          playMode === 'order' ? '顺序' : playMode === 'repeat' ? '单曲' : '随机'
        }}</a-button>
        <template #overlay>
          <a-menu>
            <a-menu-item @click="setPlayMode('order')">顺序播放</a-menu-item>
            <a-menu-item @click="setPlayMode('repeat')">单曲循环</a-menu-item>
            <a-menu-item @click="setPlayMode('random')">随机播放</a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>
    <div class="player-info">
      <img v-if="coverUrl" :src="coverUrl" class="cover" />
      <span class="song-title">{{ currentSong?.name || '未播放' }}</span>
      <span class="artist">{{ currentSong?.artist || '' }}</span>
    </div>
    <div class="player-progress">
      <a-slider
        :min="0"
        :max="duration"
        v-model:value="currentTime"
        @change="onSeek"
        style="width: 120px" />
      <span>{{ formatTime(currentTime) }} / {{ formatTime(duration) }}</span>
    </div>
    <a-button v-if="lyric" @click="showLyric = !showLyric" style="margin-left: 8px">歌词</a-button>
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
  flex-direction: row;
  align-items: center;
  padding: 8px 24px;
  height: 64px;
  flex-wrap: wrap;
}
.player-controls {
  display: flex;
  gap: 8px;
}
.player-info {
  flex: 1;
  margin-left: 24px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  align-items: flex-start;
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
    padding: 8px 4px;
  }
  .player-info {
    margin-left: 0;
    align-items: center;
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

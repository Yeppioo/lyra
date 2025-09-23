<template>
  <div>
    <audio
      ref="audioRef"
      :src="playerStore.currentSong?.url"
      @ended="onAudioEnded"
      @timeupdate="onTimeUpdate"
      @canplay="onCanPlay"
      style="display: none"></audio>
    <div v-if="playerStore.currentSong || true" class="control-container">
      <div class="progress">
        <span class="progress-text current-time">
          {{ formatSecondsToMinutes(playerStore.currentSong?.currentTime) }}
        </span>
        <div class="slider-container">
          <a-slider
            ref="sliderRef"
            :tooltipOpen="false"
            class="progress-slider"
            :value="currentTime"
            v-model="currentTime"
            :max="playerStore.currentSong?.duration ? playerStore.currentSong.duration / 1000 : 0"
            :step="1"
            :tip-formatter="formatSecondsToMinutes" />
          <a-slider
            @change="onProgressChange"
            :tooltipOpen="false"
            class="progress-slider"
            id="progress-change-slider"
            :max="playerStore.currentSong?.duration ? playerStore.currentSong.duration / 1000 : 0"
            :step="1"
            :tip-formatter="formatSecondsToMinutes" />
        </div>
        <span class="progress-text current-time">
          {{ formatSecondsToMinutes(playerStore.currentSong?.duration) }}
        </span>
      </div>
      <div class="main-section">
        <div class="info">
          <div @click="toggleFullScreenLyrics" class="icon-container">
            <div class="icon-mask">
              <font-awesome-icon class="icon-mask-icon" size="xl" :icon="['fas', 'expand']" />
            </div>
            <a-image
              :preview="previewType"
              :fallback="fallbackImg"
              :placeholder="true"
              class="icon-img"
              :width="48"
              :height="48"
              :src="playerStore.currentSong?.cover">
            </a-image>
          </div>
          <div class="info-text">
            <a
              @click.stop="jumper.jumpSong(playerStore.currentSong?.id as unknown as string)"
              class="song-name no-before">
              {{ playerStore.currentSong?.name }}
            </a>
            <div class="ar-name-container">
              <template v-for="a in playerStore.currentSong?.artist" :key="a.id">
                <a @click.stop="jumper.jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
              </template>
            </div>
          </div>
        </div>
        <div class="control">
          <div class="control-buttons">
            <font-awesome-icon
              :icon="['fas', 'step-backward']"
              class="control-icon"
              @click="playerStore.playPrevious()" />
            <font-awesome-icon
              :icon="['fas', playerStore.isPlaying ? 'pause' : 'play']"
              class="control-icon play-pause"
              @click="togglePlay()" />
            <font-awesome-icon
              :icon="['fas', 'step-forward']"
              class="control-icon"
              @click="playerStore.playNext()" />
          </div>
        </div>
        <div class="right-section">
          <button class="sub-control-button" @click="toggleVolumePopup">
            <font-awesome-icon size="1x" :icon="['fas', 'volume-high']" />
          </button>
          <button class="sub-control-button" @click="togglePlayModePopup">
            <font-awesome-icon size="1x" :icon="playModeIcon" />
          </button>
          <button class="sub-control-button" @click="togglePlaylistPopup">
            <font-awesome-icon size="1x" :icon="['fas', 'list-ul']" />
          </button>
        </div>
      </div>
    </div>

    <!-- 音量控制弹出框 -->
    <div v-if="showVolumePopup" class="volume-popup">
      <a-slider
        vertical
        :min="0"
        :max="100"
        :step="1"
        class="volume-slider"
        v-model:value="playerStore.volume"
        @change="onVolumeChange" />
      <span>{{ playerStore.volume }}%</span>
    </div>

    <!-- 播放模式弹出框 -->
    <div v-if="showPlayModePopup" class="play-mode-popup">
      <div
        class="mode-item"
        :class="{ active: playerStore.state.playMode === 'order' }"
        @click="setPlayMode('order')">
        <font-awesome-icon :icon="['fas', 'repeat']" />
        <span>顺序播放</span>
      </div>
      <div
        class="mode-item"
        :class="{ active: playerStore.state.playMode === 'repeat' }"
        @click="setPlayMode('repeat')">
        <font-awesome-icon :icon="['fas', 'repeat']" />
        <span>单曲循环</span>
      </div>
      <div
        class="mode-item"
        :class="{ active: playerStore.state.playMode === 'random' }"
        @click="setPlayMode('random')">
        <font-awesome-icon :icon="['fas', 'random']" />
        <span>随机播放</span>
      </div>
      <div
        class="mode-item"
        :class="{ active: playerStore.state.playMode === 'list' }"
        @click="setPlayMode('list')">
        <font-awesome-icon :icon="['fas', 'repeat']" />
        <span>列表循环</span>
      </div>
    </div>

    <!-- 歌单弹出框 -->
    <div v-if="showPlaylistPopup" class="playlist-popup">
      <div class="playlist-header">
        <h3 class="playlist-title">播放列表</h3>
        <div>
          <font-awesome-icon
            class="del-icon"
            style="margin-right: 8px"
            :icon="['fas', 'trash']"
            @click.stop="
              if (
                playerStore.state.playListGroup.length >= 1 &&
                playerStore.state.playListGroup[playerStore.state.groupIndex]
              ) {
                openBox = true;
              }
            " />
          <a-select
            v-model:value="playerStore.state.groupIndex"
            style="width: 120px"
            @change="playerStore.switchPlaylist"
            :options="
              playerStore.state.playListGroup.map((group, idx) => ({
                value: idx,
                label: group.name,
              }))
            "></a-select>
        </div>
      </div>
      <ul class="song-list">
        <li
          v-for="(song, index) in playerStore.state.playListGroup[playerStore.state.groupIndex]
            ?.songs"
          :key="song.id"
          :class="{ 'current-playing': song.id === playerStore.currentSong?.id }"
          @click="playSongFromPlaylist(song.id, index)"
          @mouseenter="hoveredSongId = song.id"
          @mouseleave="hoveredSongId = null">
          <span class="song-info">
            {{ song.name }} - {{ song.artist.map((a) => a.name).join(' , ') }}
          </span>
          <span class="song-duration">
            {{ formatSecondsToMinutes(song.duration) }}
          </span>
          <font-awesome-icon
            :icon="['fas', 'trash']"
            class="delete-icon"
            @click.stop="deleteSongFromPlaylist(song.id, playerStore.state.groupIndex)" />
        </li>
      </ul>
    </div>
  </div>
  <!-- 蒙版 -->
  <div v-if="showOverlay" class="overlay" @click="closeAllPopups"></div>
  <a-modal v-model:open="openBox" title="提示" @ok="handleDel">
    <template #footer>
      <a-button @click="openBox = false" class="cancel-button">取消</a-button>
      <a-button @click="handleDel" class="highlight-button">删除</a-button>
    </template>
    <p>
      确认删除歌单: "{{ playerStore.state.playListGroup[playerStore.state.groupIndex].name }}" ?<br />歌单内容将被永久移除
    </p>
  </a-modal>
</template>
<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref, watch, computed } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useUIPropertiesStore } from '@/stores/uiProperties'; // 引入 uiPropertiesStore
import { fallbackImg } from '@/stores/constant';

const playerStore = usePlayerStore();
const uiPropertiesStore = useUIPropertiesStore(); // 使用 uiPropertiesStore

const audioRef = ref<HTMLAudioElement | null>(null);
const showVolumePopup = ref(false);
const showPlayModePopup = ref(false);

const openBox = ref(false);

const showPlaylistPopup = ref(false);
const hoveredSongId = ref<number | null>(null); // 新增：用于跟踪鼠标悬停的歌曲ID
// 移除 showFullScreenLyrics，因为它现在由 uiPropertiesStore 管理
// 移除 isPlaying，因为它现在由 playerStore 管理

// 计算属性，判断是否有任何弹出框显示
const showOverlay = computed(() => {
  return showVolumePopup.value || showPlayModePopup.value || showPlaylistPopup.value;
});

const handleDel = () => {
  openBox.value = false;
  message.success(`已删除: ${playerStore.state.playListGroup[playerStore.state.groupIndex].name}`);

  setTimeout(() => {
    playerStore.currentSong = null;
    playerStore.state.playListGroup.splice(playerStore.state.groupIndex, 1);
    if (playerStore.state.playListGroup.length === 0) {
      playerStore.state.playListGroup.push({
        name: '默认歌单',
        songs: [],
        songIndex: 0,
        canDelete: true,
      });
    }
    playerStore.state.groupIndex = 0;
  }, 1);
};

// 计算属性，根据播放模式返回不同的图标
const playModeIcon = computed(() => {
  switch (playerStore.state.playMode) {
    case 'order':
      return ['fas', 'repeat'];
    case 'repeat':
      return ['fas', 'repeat'];
    case 'random':
      return ['fas', 'random'];
    case 'single':
      return ['fas', 'repeat']; // 单曲循环的图标
    case 'list':
      return ['fas', 'repeat'];
    default:
      return ['fas', 'repeat'];
  }
});

const onProgressChange = (value: number) => {
  if (audioRef.value) {
    audioRef.value.currentTime = value;
  }
};

function togglePlay() {
  playerStore.togglePlay();
}

function onCanPlay() {
  if (playerStore.currentSong?.url) {
    playerStore.play(); // 直接调用 playerStore 的 play 方法
    // 设置音量
    if (audioRef.value) {
      audioRef.value.volume = playerStore.volume / 100;
    }
  }
}

function onAudioEnded() {
  playerStore.onSongEnded();
  // 如果是单曲循环模式，则重新播放
  if (playerStore.state.playMode === 'repeat') {
    if (audioRef.value) {
      audioRef.value.currentTime = 0;
    }
    playerStore.play(); // 直接调用 playerStore 的 play 方法
  }
}

function onTimeUpdate(e: Event) {
  const audio = e.target as HTMLAudioElement;
  if (playerStore.currentSong) {
    playerStore.currentSong = {
      ...playerStore.currentSong,
      currentTime: audio.currentTime * 1000,
    };
  }
}

// 监听 audio 的 play/pause 事件，自动同步 isPlaying
import { onMounted, onBeforeUnmount } from 'vue';
import * as jumper from '@/utils/jumper';
import { message } from 'ant-design-vue';
onMounted(() => {
  if (audioRef.value) {
    playerStore.setAudioElement(audioRef.value); // 设置 audio 元素
    // 移除事件监听，因为播放状态由 playerStore 管理
  }
});

onBeforeUnmount(() => {
  if (audioRef.value) {
    // 移除事件监听
  }
});
const previewType = false;
// 移除 handlePlayEvent 和 handlePauseEvent

// 监听 currentSong 变化，更新 document.title 并在有 URL 时自动播放
watch(
  () => playerStore.currentSong,
  (newSong) => {
    document.title = newSong ? `Lyra - ${newSong.name}` : 'Lyra';
    // 移除自动播放逻辑，由用户手动触发或 onCanPlay 根据 isPlaying 状态决定
  },
  { immediate: true }
);

// 监听音量变化，同步到 audio 元素
// 移除对 playerStore.volume 的监听，因为现在由 playerStore 内部管理

function closeAllPopups() {
  showVolumePopup.value = false;
  showPlayModePopup.value = false;
  showPlaylistPopup.value = false;
}

function toggleVolumePopup() {
  closeAllPopups(); // 关闭所有弹出框
  showVolumePopup.value = !showVolumePopup.value;
}

function togglePlayModePopup() {
  closeAllPopups(); // 关闭所有弹出框
  showPlayModePopup.value = !showPlayModePopup.value;
}

function togglePlaylistPopup() {
  closeAllPopups(); // 关闭所有弹出框
  showPlaylistPopup.value = !showPlaylistPopup.value;
}

function onVolumeChange(value: number) {
  playerStore.setVolume(value);
}

function setPlayMode(mode: 'order' | 'repeat' | 'random' | 'single' | 'list') {
  playerStore.setPlayMode(mode);
  showPlayModePopup.value = false; // 关闭弹出框
}

function deleteSongFromPlaylist(songId: number, groupIndex: number) {
  playerStore.deleteSong(songId, groupIndex);
}

function playSongFromPlaylist(songId: number, index: number) {
  const group = playerStore.state.playListGroup[playerStore.state.groupIndex];
  if (group) {
    group.songIndex = index;
    playerStore.currentSongId = songId;
    // 播放歌曲后不需要关闭弹出框，用户可能想继续浏览或删除
    // showPlaylistPopup.value = false;
  }
}

const formatSecondsToMinutes = (seconds: number | undefined) => {
  if (!seconds) return '00:00';
  seconds = seconds / 1000;
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

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

function toggleFullScreenLyrics() {
  if (!playerStore.currentSong) return;
  uiPropertiesStore.toggleFullScreenLyrics(); // 调用 uiPropertiesStore 中的方法
}
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
:deep(.ant-image-img) {
  height: 48px;
  width: 48px;
}
.current-playing span {
  color: #70baff !important;
}
:deep(.ant-select-selection-item) {
  color: var(--y-text);
  font-family: var(--y-font);
}
.info-text span,
.ar-name,
.song-name {
  color: var(--y-text);
  font-family: var(--y-font);
  line-height: 1.3;
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}
.ar-name {
  margin-top: 2px;
  font-size: 12px;
  color: #909092 !important;
  padding: 0;
  min-width: 35px;
  font-family: var(--y-font);
  cursor: pointer;
  margin-left: 1px;
}
.ar-name ~ .ar-name::before {
  content: ',';
  margin: 0 4px 0 3px;
  color: #909092 !important;
}
.ar-name::before {
  position: static !important;
  display: inline;
}
.ar-name:hover,
.song-name:hover {
  color: #1677ff !important;
  cursor: pointer;
}
.ar-name-container {
  display: flex;
  flex-direction: row;
  max-width: calc(100vw - 310px);
  white-space: wrap;
  overflow: hidden;
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
#progress-slider {
  pointer-events: none;
}
#progress-change-slider {
  opacity: 0;
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
  position: absolute;
}
.icon-mask svg {
  color: #fff !important;
}
.icon-mask {
  position: absolute;
  z-index: 1;
  width: 48px;
  border-radius: 8px;
  display: flex;
  height: 48px;
  background: rgba(0, 0, 0, 0.575);
  justify-content: center;
  align-items: center;
  cursor: pointer;
  opacity: 0;
}
.icon-mask:hover {
  opacity: 1;
}
.icon-container {
  width: 48px;
  position: relative;
  height: 48px;
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
.slider-container {
  width: 100%;
  position: relative;
  margin-bottom: 32px;
}
.progress-slider {
  width: calc(100% - 10px);
  position: absolute;
}
/* 禁用 a-slider 的动画效果 */
:deep(.ant-slider-track),
:deep(.ant-slider-handle) {
  transition: none !important;
}
.control-buttons {
  display: flex;
  align-items: center;
  gap: 10px; /* 按钮之间的间距 */
}

.control-icon {
  font-size: 22px;
  color: var(--y-text);
  cursor: pointer;
  transition: color 0.2s ease-in-out;
  opacity: 0.85;
}
.play-pause {
  font-size: 28px;
}

.control-icon:hover {
  opacity: 1;
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
.right-section {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  position: relative;
  top: -3px;
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
  outline: none; /* 移除蓝色圈圈 */
}
.play-button i {
  width: 38px;
  height: 38px;
  display: flex;
  background-color: #70baff;
  border-radius: 50%;
}
/* 移除播放/暂停按钮的旋转动画 */
.play-button:hover i {
  transform: scale(1.1);
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
.control-button,
.sub-control-button {
  color: var(--y-text);
  cursor: pointer;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 0;
  background-color: transparent;
  border-radius: 50%;
  outline: none; /* 移除蓝色圈圈 */
}
.del-icon:hover {
  color: #70baff;
  cursor: pointer;
}
.sub-control-button:hover svg {
  color: #70baff !important;
}
.control-button:hover {
  background-color: #70baff;
  /* path {
    fill: white;
  } */
}

.volume-popup,
.play-mode-popup,
.playlist-popup {
  position: absolute;
  bottom: 80px;
  background-color: var(--y-com-bg);
  border-radius: 8px;
  padding: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.volume-popup span {
  font-size: 14px;
  width: 35px;
  text-align: center;
}
.volume-popup span,
.play-mode-popup span,
.playlist-popup span {
  font-family: var(--y-font);
  color: var(--y-text);
}
.mode-item.active span,
.mode-item.active svg {
  color: #70baff !important;
}
.volume-slider {
  margin-top: 10px;
}

.volume-popup {
  right: 100px;
  height: 150px;
  display: flex;
  user-select: none;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.play-mode-popup {
  right: 50px; /* 根据实际布局调整 */
  width: 130px;
  user-select: none;
}

.play-mode-popup .mode-item {
  display: flex;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  color: var(--y-text);
}

.play-mode-popup .mode-item:hover {
  background-color: var(--y-background);
}

.play-mode-popup .mode-item.active {
  color: var(--y-active-color);
}

.play-mode-popup .mode-item span {
  margin-left: 8px;
}

.playlist-popup {
  user-select: none;
  right: 10px;
  max-width: 300px;
  width: calc(100vw - 20px);
  display: flex;
  flex-direction: column;
  padding: 0; /* 移除整体 padding，让 header 和 list 自己控制 */
}

.playlist-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px; /* 头部内边距 */
  border-bottom: 1px solid var(--y-background);
  position: sticky;
  top: 0;
  z-index: 1;
}

.playlist-header .playlist-title {
  color: var(--y-text);
  margin: 0;
  font-size: 16px;
  margin-left: 8px;
}
:deep(.ant-select-selector) {
  background-color: transparent !important;
}

.song-list {
  list-style: none;
  padding: 0 10px 10px 10px; /* 列表内边距，底部留出空间 */
  margin: 0;
  flex-grow: 1;
  max-height: 363px; /* 调整最大高度，留出头部空间 */
  overflow-y: auto;
}

.playlist-popup li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  cursor: pointer;
  color: var(--y-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-popup li:hover {
  background-color: var(--y-background);
}

.playlist-popup li.current-playing {
  color: #70baff; /* 使用主题色 */
  font-weight: bold;
}

.song-info {
  flex-grow: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 10px; /* 为时间留出空间 */
}

.song-duration {
  font-size: 12px;
  color: #909092;
  margin-left: auto; /* 将时间推到右边 */
  flex-shrink: 0; /* 防止时间被挤压 */
}

.delete-icon {
  margin-left: 10px;
  color: var(--y-text);
  cursor: pointer;
  opacity: 0; /* 默认隐藏 */
  transition: opacity 0.2s;
}

.playlist-popup li .delete-icon {
  display: none;
  opacity: 1;
}
.playlist-popup li:hover .delete-icon {
  display: unset;
}

.delete-icon:hover {
  color: #ff4d4f; /* 删除按钮的悬停颜色 */
  opacity: 1;
}
.control-button:hover > svg {
  color: #fff !important;
}
/* .current-playing .song-info {
  flex-grow: 1;
  white-space: break-spaces;
  text-wrap: auto;
  overflow: hidden;
  margin-right: 10px;
  text-wrap-mode: wrap;
  overflow-wrap: break-word;
} */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5); /* 半透明黑色 */
  z-index: 999; /* 确保在弹出框之下，但在其他内容之上 */
}
</style>

<template>
  <Transition name="full-screen-lyrics">
    <div v-if="visible" class="full-screen-lyrics-container">
      <div class="lyrics-header">
        <div class="header-right">
          <font-awesome-icon
            :icon="['fas', 'expand']"
            class="fullscreen-icon"
            @click="toggleFullScreen" />
          <font-awesome-icon :icon="['fas', 'chevron-down']" class="close-icon" @click="closeLyrics" />
        </div>
      </div>
      <div class="lyrics-main-content">
        <div class="left-section">
          <div class="cover-container">
            <img :src="currentSong?.cover" alt="Album Cover" class="cover-img" />
          </div>
          <div class="song-info">
            <span class="song-name">{{ currentSong?.name }}</span>
            <span class="artist-name">{{ currentSong?.artist }}</span>
          </div>
          <div class="player-controls">
            <!-- 播放进度条 -->
            <div class="progress-bar-container">
              <span class="current-time">{{ formatTime(currentSong?.currentTime || 0) }}</span>
              <div class="slider-container">
                <a-slider
                  :tooltipOpen="false"
                  class="progress-slider"
                  :value="currentSong?.currentTime"
                  id="progress-slider"
                  :max="playerStore.currentSong?.duration || 0"
                  :step="1000"
                  :tip-formatter="formatTime" />
                <a-slider
                  @change="onProgressChange"
                  :tooltipOpen="false"
                  class="progress-slider"
                  id="progress-change-slider"
                  :max="playerStore.currentSong?.duration || 0"
                  :step="1000"
                  :tip-formatter="formatTime" />
              </div>
              <span class="duration">{{ formatTime(playerStore.currentSong?.duration || 0) }}</span>
            </div>
            <!-- 播放控制按钮 -->
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
        </div>
        <div class="right-section">
          <div class="lyrics-content" ref="lyricsContentRef">
            <p
              v-for="(line, index) in parsedLyrics"
              :key="index"
              :class="{ active: index === activeLineIndex }"
              class="lyrics-line">
              {{ line.text }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useUIPropertiesStore } from '@/stores/uiProperties';

let intervalId: ReturnType<typeof setInterval> | null = null; // 用于存储定时器ID

const playerStore = usePlayerStore();
const uiPropertiesStore = useUIPropertiesStore();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close']);

const lyricsContentRef = ref<HTMLElement | null>(null);
const activeLineIndex = ref(-1);

const currentSong = computed(() => playerStore.currentSong);
const lyrics = computed(() => playerStore.currentSong?.lyric || '');

// 解析歌词，将时间戳和歌词文本分离
const parsedLyrics = computed(() => {
  const lines = lyrics.value.split('\n');
  const result: { time: number; text: string }[] = [];
  lines.forEach((line: string) => {
    const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3].padEnd(3, '0')); // 统一为3位
      const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
      const text = match[4].trim();
      if (text) {
        result.push({ time, text });
      }
    } else if (line.trim()) {
      // 处理没有时间戳的歌词行
      result.push({ time: -1, text: line.trim() });
    }
  });
  return result;
});

function togglePlay() {
  playerStore.togglePlay();
}

onMounted(() => {
  intervalId = setInterval(updateLyricsPosition, 100);
});

onBeforeUnmount(() => {
  // 清除定时器
  if (intervalId) {
    clearInterval(intervalId);
  }
});

async function updateLyricsPosition() {
  const newTime = playerStore.currentSong?.currentTime;
  if (!props.visible || !newTime) {
    activeLineIndex.value = -1;
    return;
  }

  const currentTimeMs = newTime; // currentTime 已经是毫秒

  let foundIndex = -1;
  for (let i = 0; i < parsedLyrics.value.length; i++) {
    if (parsedLyrics.value[i].time !== -1 && currentTimeMs >= parsedLyrics.value[i].time) {
      foundIndex = i;
    } else if (parsedLyrics.value[i].time === -1 && foundIndex === -1) {
      // 如果是纯文本歌词，且还没有找到带时间戳的歌词，则默认高亮第一行
      foundIndex = 0;
    }
  }
  activeLineIndex.value = foundIndex;

  // 滚动歌词到视图中央
  if (lyricsContentRef.value && activeLineIndex.value !== -1) {
    const activeLineElement = lyricsContentRef.value.querySelector(
      '.lyrics-line.active'
    ) as HTMLElement;
    if (activeLineElement) {
      const containerHeight = lyricsContentRef.value.clientHeight;
      const lineHeight = activeLineElement.clientHeight;
      const scrollPosition = activeLineElement.offsetTop - (containerHeight * 0.33) + (lineHeight / 2);
      lyricsContentRef.value.scrollTo({
        top: scrollPosition,
        behavior: 'smooth', // 始终平滑滚动
      });
    }
  }
}

watch(
  () => currentSong.value?.cover,
  (newCover) => {
    if (newCover) {
      document.documentElement.style.setProperty('--lyrics-bg-image', `url(${newCover})`);
    } else {
      document.documentElement.style.removeProperty('--lyrics-bg-image');
    }
  },
  { immediate: true }
);

function closeLyrics() {
  emit('close');
}

function toggleFullScreen() {
  uiPropertiesStore.toggleFullScreen();
}

function formatTime(seconds: number): string {
  if (!seconds) return '00:00';
  seconds = seconds / 1000;
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function seek(value: number) {
  playerStore.seek(value);
}

function onProgressChange(value: number) {
  seek(value);
}
</script>

<style scoped>
*{
  user-select: none;
  color: #FEFEFE;
}
.full-screen-lyrics-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: var(--y-bg); /* 使用主题背景色 */
  z-index: 9999;
  display: flex;
  flex-direction: column;
  color: #FEFEFE;
  font-family: var(--y-font);
  background-size: cover;
  background-position: center;
}

.full-screen-lyrics-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: var(--lyrics-bg-image); /* 使用 CSS 变量设置背景图 */
  background-size: cover;
  background-position: center;
  filter: blur(50px) brightness(0.6); /* 模糊和亮度调整 */
  z-index: -1; /* 确保在内容下方 */
  transition: background-image 0.5s ease-in-out;
}

.lyrics-header {
  display: flex;
  justify-content: flex-end; /* 将内容推到右边 */
  align-items: center;
    padding: 25px 30px 0 0;  position: relative;
  z-index: 10;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px; /* 按钮之间的间距 */
}

.close-icon,
.fullscreen-icon {
  font-size: 24px;
  cursor: pointer;
  color:#FEFEFE;
}

.lyrics-main-content {
  display: grid;
  grid-template-columns: 1fr 1fr; /* 左右两栏 */
  flex-grow: 1;
  overflow: hidden; /* 防止内容溢出 */
  padding: 20px 50px; /* 整体内边距 */
}

.left-section {
  display: flex;
  flex-direction: column; /* 垂直布局 */
  align-items: center;
  justify-content: center;
  padding-right: 50px;
}

.cover-container {
  width: 350px; /* 正方形宽度 */
  height: 350px; /* 正方形高度 */
  border-radius: 12px; /* 圆角 */
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  margin-bottom: 30px; /* 与下方歌曲信息的间距 */
}

.cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  text-align: center;
  margin-bottom: 30px; /* 与播放控制区域的间距 */
}
#progress-slider {
  pointer-events: none;
}
#progress-change-slider {
  opacity: 0;
}
.song-info .song-name {
  font-size: 28px;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: #FEFEFE;
}

.song-info .artist-name {
  font-size: 18px;
  color: var(--y-text-light);
  display: block;
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 400px; /* 限制播放控制区域宽度 */
}
.progress-bar-container {
  display: flex;
  width: 100%;
  margin-bottom: 20px;
}

.current-time,
.duration {
  font-size: 14px;
  color: var(--y-text-light);
  width: 40px;
  text-align: center;
}

.slider-container {
  width: 100%;
  position: relative;
  margin: 0 15px;
  display: flex;
  align-items: center;
}

.progress-slider {
  width: 100%;
  position: absolute;
  margin: 0;
}

:deep(.ant-slider-track),
:deep(.ant-slider-handle) {
  transition: none !important;
}

.control-buttons {
  display: flex;
  align-items: center;
  gap: 30px; /* 按钮之间的间距 */
}

.control-icon {
  font-size: 24px;
  color: var(--y-text-light);
  cursor: pointer;
  transition: color 0.2s ease-in-out;
}

.control-icon:hover {
  color: var(--y-active-color);
}

.play-pause {
  font-size: 36px;
  color: var(--y-active-color);
}

.right-section {
  display: flex;
  flex-direction: column;
  /* padding-left: 50px; 与左侧专辑封面图的间距 */
  overflow-y: auto;
  max-height: 100%; /* 歌词区域高度自适应 */
}

@media (max-width: 1024px) {
  .lyrics-main-content {
    grid-template-columns: 1fr; /* 平板端单列布局 */
    padding: 20px;
  }

  .left-section {
    padding-right: 0;
    margin-bottom: 40px;
  }

  .cover-container {
    width: 250px;
    height: 250px;
    margin-bottom: 20px;
  }

  .song-info {
    margin-bottom: 20px;
  }

  .right-section {
    padding-left: 0;
  }
}

@media (max-width: 768px) {
  .lyrics-main-content {
    padding: 15px;
  }

  .left-section {
    display: none; /* 手机端隐藏专辑封面图和控制 */
  }

  .right-section {
    padding: 0;
  }

  .lyrics-header {
    padding: 10px 15px;
  }

  .close-icon,
  .fullscreen-icon {
    font-size: 20px;
  }
}

.lyrics-content {
  flex-grow: 1;
  overflow-y: auto;
  text-align: left; /* 歌词居左对齐 */
  padding-top: 50%; /* 初始时将歌词内容向下推，使其在中间偏上 */
  padding-bottom: 50%; /* 确保底部有足够的空间滚动 */
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
  /* 隐藏滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.lyrics-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.lyrics-line {
  margin-bottom: 40px;
  font-size: 31px;
  color: rgba(255, 255, 255, 0.15); /* 未选中歌词偏透明 */
  transition:
    color 0.3s ease-in-out,
    font-size 0.3s ease-in-out;
  line-height: 1.6;
}

.lyrics-line.active {
  color: #ffffff; /* 活跃歌词颜色为白色 */
  font-size: 38px;
  font-weight: bold;
}

/* 过渡动画 */
.full-screen-lyrics-enter-active,
.full-screen-lyrics-leave-active {
  transition: all 0.3s ease;
}

.full-screen-lyrics-enter-from {
  transform: translateY(100%);
}

.full-screen-lyrics-leave-to {
  transform: translateY(100%);
}
</style>

<template>
  <Transition name="full-screen-lyrics">
    <div v-if="visible" class="full-screen-lyrics-container">
      <div class="lyrics-header">
        <div class="header-left">
          <div class="cover-title">
            <img :src="currentSong?.cover" alt="Album Cover" class="cover-img" />
          </div>
          <div class="song-info-title">
            <a  @click.stop="jumper.jumpSong(currentSong?.id as unknown as string);closeLyrics()" class="song-name-title no-before">{{ currentSong?.name }}</a>
            <div class="ar-name-container ar-name-container-title">
              <template v-for="a in playerStore.currentSong?.artist" :key="a.id">
                <a @click.stop="jumper.jumpArtist(a.id);closeLyrics()" class="ar-name-title">{{ a.name }}</a>
              </template>
            </div>
          </div>
        </div>
        <div class="header-right">
          <font-awesome-icon
            :icon="['fas', 'expand']"
            class="fullscreen-icon"
            @click="toggleFullScreen" />
          <font-awesome-icon
            :icon="['fas', 'chevron-down']"
            class="close-icon"
            @click="closeLyrics" />
        </div>
      </div>
      <div class="lyrics-main-content">
        <div class="left-section">
          <div class="left-container">
            <div class="cover-container">
              <img :src="currentSong?.cover" alt="Album Cover" class="cover-img" />
            </div>
            <div class="song-info">
              <a @click.stop="jumper.jumpSong(currentSong?.id as unknown as string);closeLyrics()" class="song-name">{{ currentSong?.name }}</a>
              <div class="ar-name-container">
                <template v-for="a in playerStore.currentSong?.artist" :key="a.id">
                  <a @click.stop="jumper.jumpArtist(a.id);closeLyrics()" class="ar-name">{{ a.name }}</a>
                </template>
              </div>
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
                <span class="duration">{{
                  formatTime(playerStore.currentSong?.duration || 0)
                }}</span>
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
        </div>
        <div class="right-section">
          <div class="lyrics-content" ref="lyricsContentRef">
            <p
              v-for="(line, lineIndex) in parsedLyrics"
              :key="lineIndex"
              :class="{ active: lineIndex === activeLineIndex }"
              class="lyrics-line">
              <template v-if="line.words && line.words.length > 0 && false">
                <!-- TODO: 逐字歌词解析 -->
                <span
                  v-for="(word, wordIndex) in line.words"
                  :key="`${lineIndex}-${wordIndex}`"
                  :class="{
                    active: lineIndex === activeLineIndex && wordIndex === activeWordIndex,
                  }"
                  class="lyrics-word"
                  >{{ word.text }}</span
                >
              </template>
              <template v-else>{{ line.text }}</template>
            </p>
          </div>
          <div class="player-controls mobile-controls">
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
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { usePlayerStore } from '@/stores/player';
import { useUIPropertiesStore } from '@/stores/uiProperties';
import * as jumper from '@/utils/jumper';

interface Word {
  time: number;
  duration: number;
  text: string;
}

interface LyricLine {
  time: number;
  duration: number;
  text: string;
  words?: Word[];
}

let intervalId: ReturnType<typeof setInterval> | null = null; // 用于存储定时器ID

const playerStore = usePlayerStore();
const uiPropertiesStore = useUIPropertiesStore();

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits(['close']);

const lyricsContentRef = ref<HTMLElement | null>(null);
const activeLineIndex = ref(-1);
const activeWordIndex = ref(-1);

const currentSong = computed(() => playerStore.currentSong);
const lyrics = computed(() => playerStore.currentSong?.lyric || '');
const yrcLyrics = computed(() => playerStore.currentSong?.yrcLyric || '');

// 解析歌词，将时间戳和歌词文本分离
const parsedLyrics = computed<LyricLine[]>(() => {
  const result: LyricLine[] = [];
  const rawLyric = yrcLyrics.value || lyrics.value; // 优先使用逐字歌词

  if (!rawLyric) return [];

  const lines = rawLyric.split('\n');

  lines.forEach((line: string) => {
    // 尝试解析JSON元数据
    if (line.startsWith('{"t":')) {
      try {
        JSON.parse(line); // 尝试解析，如果成功则跳过此行，因为是元数据
        return;
      } catch {
        // 不是JSON，继续按歌词处理
      }
    }

    // 逐字歌词格式: [16210,3460](16210,670,0)还(16880,410,0)没...
    const yrcMatch = line.match(/^\[(\d+),(\d+)\](.*)/);
    if (yrcMatch) {
      const lineTime = parseInt(yrcMatch[1]);
      const lineDuration = parseInt(yrcMatch[2]);
      const rawWords = yrcMatch[3];
      const words: Word[] = [];
      let lineText = '';

      // 解析逐字歌词
      const wordRegex = /\((\d+),(\d+),(\d+)\)([^(\[]+)/g;
      let wordMatch;
      while ((wordMatch = wordRegex.exec(rawWords)) !== null) {
        const wordTime = parseInt(wordMatch[1]);
        const wordDuration = parseInt(wordMatch[2]);
        const wordText = wordMatch[4];
        words.push({ time: wordTime, duration: wordDuration, text: wordText });
        lineText += wordText;
      }
      if (lineText) {
        result.push({ time: lineTime, duration: lineDuration, text: lineText, words });
      }
    } else {
      // 普通歌词格式: [00:18.610]歌词文本
      const lrcMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (lrcMatch) {
        const minutes = parseInt(lrcMatch[1]);
        const seconds = parseInt(lrcMatch[2]);
        const milliseconds = parseInt(lrcMatch[3].padEnd(3, '0')); // 统一为3位
        const time = minutes * 60 * 1000 + seconds * 1000 + milliseconds;
        const text = lrcMatch[4].trim();
        if (text) {
          result.push({ time, duration: 0, text }); // 普通歌词没有逐字时长
        }
      } else if (line.trim()) {
        // 处理没有时间戳的歌词行
        result.push({ time: -1, duration: 0, text: line.trim() });
      }
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
  if (!props.visible || newTime === undefined || newTime === null) {
    activeLineIndex.value = -1;
    activeWordIndex.value = -1;
    return;
  }

  const currentTimeMs = newTime;

  let foundLineIndex = -1;
  let foundWordIndex = -1;

  for (let i = 0; i < parsedLyrics.value.length; i++) {
    const line = parsedLyrics.value[i];
    if (line.time !== -1 && currentTimeMs >= line.time) {
      foundLineIndex = i;
      // 如果是逐字歌词，进一步查找当前激活的字
      if (line.words && line.words.length > 0) {
        for (let j = 0; j < line.words.length; j++) {
          const word = line.words[j];
          if (currentTimeMs >= word.time && currentTimeMs < word.time + word.duration) {
            foundWordIndex = j;
            break;
          }
        }
      }
    } else if (line.time === -1 && foundLineIndex === -1) {
      // 如果是纯文本歌词，且还没有找到带时间戳的歌词，则默认高亮第一行
      foundLineIndex = 0;
    }
  }
  activeLineIndex.value = foundLineIndex;
  activeWordIndex.value = foundWordIndex;

  // 滚动歌词到视图中央
  if (lyricsContentRef.value && activeLineIndex.value !== -1) {
    const activeLineElement = lyricsContentRef.value.querySelector(
      '.lyrics-line.active'
    ) as HTMLElement;
    if (activeLineElement) {
      const containerHeight = lyricsContentRef.value.clientHeight;
      const lineHeight = activeLineElement.clientHeight;
      const scrollPosition = activeLineElement.offsetTop - containerHeight * 0.33 + lineHeight / 2;
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
* {
  user-select: none;
  color: #fefefe;
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
  color: #fefefe;
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
  justify-content: space-between;
  align-items: center;
  padding: 25px 30px 0 30px;
  position: relative;
  z-index: 10;
}
.lyrics-word {
  font-size: calc(30px - 4px);
  color: rgba(255, 255, 255, 0.15);
  transition:
    color 0.3s ease-in-out,
    font-size 0.3s ease-in-out;
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
  color: #fefefe;
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
  margin-bottom: 50px;
}

.cover-container {
  width: min(
    350px,
    calc(100vh - 320px)
  ); /* 根据高度动态调整宽度，最大350px，为控制区留出更多空间 */
  height: min(
    350px,
    calc(100vh - 320px)
  ); /* 根据高度动态调整高度，最大350px，为控制区留出更多空间 */
  aspect-ratio: 1 / 1; /* 保持正方形 */
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
  cursor: pointer;
  font-weight: bold;
  display: block;
  margin-bottom: 8px;
  color: #fefefe;
}
.song-name{
  color: #f0f0f0 !important;
}
.song-name:hover {
  color: #fff !important;
}
.song-info{
  display: flex;    flex-direction: column;
}
.song-info .ar-name {
  font-size: 18px;
  color: var(--y-text-light);
  display: block;
  opacity: 0.75;
  cursor: pointer;
  padding: 0;
}
.song-info > .ar-name-container {
  justify-content: center;
}
.ar-name-container-title {
  margin-left: 1px;
}
.mobile-controls {
  display: none;
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
  overflow-y: hidden;
  max-height: 100%; /* 歌词区域高度自适应 */
}

.mobile-controls {
  max-width: unset;
  position: relative;
  top: -45px;
  display: none;
}
/* .header-left {
  opacity: 0;
  pointer-events: none;
} */
@media (max-width: 768px) {
  .lyrics-main-content {
    padding: 0 60px;
  }
  .header-left {
    opacity: 1;
    pointer-events: unset;
  }
  .lyrics-content {
    margin-bottom: 85px;
    margin-top: 20px;
    margin-left: 5px;
  }
  .left-section {
    display: none;
  }

  .right-section {
    padding: 0;
  }

  .lyrics-main-content {
    display: block;
  }

  .mobile-controls {
    display: flex;
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
  font-size: calc(30px - 4px);
  color: rgba(255, 255, 255, 0.15); /* 未选中歌词偏透明 */
  transition:
    color 0.3s ease-in-out,
    font-size 0.3s ease-in-out;
  line-height: 1.6;
}

.lyrics-line.active {
  color: #ffffff; /* 活跃歌词颜色为白色 */
  font-size: 30px;
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
.lyrics-word {
  display: inline-block;
  transition: color 0.1s ease-in-out;
}

.lyrics-word.active {
  color: #ffffff;
}
.cover-title {
  width: 44px;
  height: 44px;
  aspect-ratio: 1 / 1; /* 保持正方形 */
  border-radius: 8px; /* 圆角 */
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}
.header-left {
  display: flex;
  align-items: center;
}
.song-info-title {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
  margin-top: 3px;
}
.song-info-title span {
  color: #fefefe;
  font-family: var(--y-font);
  line-height: 1.1;
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}
.song-name-title {
  font-size: 15px;
  color: #f0f0f0 !important;
  line-height: 1.2;
  cursor: pointer;
}
.song-name-title:hover {
  color: #fff !important;
}
.ar-name ~ .ar-name::before,
.ar-name-title ~ .ar-name-title::before {
  content: ',';
  margin: 0 5px;
  color: #fff !important;
  opacity: 0.75 !important;
}
.ar-name-title::before,
.ar-name::before {
  position: static !important;
  display: inline;
}
.ar-name-title:hover,
.ar-name:hover {
  opacity: 1;
  color: #fff !important;
}
.ar-name-container {
  display: flex;
  flex-direction: row;
  max-width: calc(100vw - 310px);
  white-space: wrap;
  overflow: hidden;
}
.ar-name-title {
  font-size: 12px;
  cursor: pointer;
  opacity: 0.75;
  padding: 0;
}
</style>

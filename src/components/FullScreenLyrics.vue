<template>
  <Transition name="full-screen-lyrics">
    <div v-if="visible" class="full-screen-lyrics-container">
      <div class="lyrics-header">
        <font-awesome-icon
          :icon="['fas', 'chevron-down']"
          class="close-icon"
          @click="closeLyrics" />
        <div class="song-info">
          <span class="song-name">{{ currentSong?.name }}</span>
          <span class="artist-name">{{ currentSong?.artist }}</span>
        </div>
      </div>
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
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { usePlayerStore } from '@/stores/player';

const playerStore = usePlayerStore();

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

// 监听歌曲播放时间，高亮显示当前歌词
watch(
  () => playerStore.currentSong?.currentTime,
  async (newTime) => {
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
      await nextTick();
      const activeLineElement = lyricsContentRef.value.querySelector(
        '.lyrics-line.active'
      ) as HTMLElement;
      if (activeLineElement) {
        const containerHeight = lyricsContentRef.value.clientHeight;
        const lineHeight = activeLineElement.clientHeight;
        const scrollPosition = activeLineElement.offsetTop - containerHeight / 2 + lineHeight / 2;
        lyricsContentRef.value.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      }
    }
  },
  { immediate: true }
);

function closeLyrics() {
  emit('close');
}
</script>

<style scoped>
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
  color: var(--y-text);
  font-family: var(--y-font);
}

.lyrics-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid var(--y-background);
  background-color: var(--y-bg);
  position: relative;
  z-index: 10;
}

.close-icon {
  font-size: 24px;
  cursor: pointer;
  margin-right: 20px;
}

.song-info {
  display: flex;
  flex-direction: column;
}

.song-name {
  font-size: 18px;
  font-weight: bold;
}

.artist-name {
  font-size: 14px;
  color: #909092;
  margin-top: 5px;
}

.lyrics-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 20px;
  text-align: center;
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 15%,
    black 85%,
    transparent 100%
  );
  mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%);
}

.lyrics-line {
  margin-bottom: 15px;
  font-size: 16px;
  color: var(--y-text-light);
  transition:
    color 0.3s ease-in-out,
    transform 0.3s ease-in-out;
  line-height: 1.5;
}

.lyrics-line.active {
  color: var(--y-active-color); /* 活跃歌词颜色 */
  font-size: 20px;
  font-weight: bold;
  transform: scale(1.1);
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

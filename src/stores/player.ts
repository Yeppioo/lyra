// 设置当前播放歌曲，自动初始化播放列表等
export function setCurrentSong(song: SongInfo, playerStore: ReturnType<typeof usePlayerStore>) {
  const state = playerStore.state;
  // 初始化播放列表组
  if (!state.playListGroup) {
    state.playListGroup = [];
  }
  if (state.playListGroup.length === 0) {
    state.playListGroup.push({
      name: '默认歌单',
      songs: [],
      songIndex: 0,
      canDelete: false,
    });
  }
  if (!state.playListGroup[0].songs) {
    state.playListGroup[0].songs = [];
  }
  // 检查是否已存在该歌曲
  const existIdx = state.playListGroup[0].songs.findIndex((s: SongInfo) => s.id === song.id);
  if (existIdx === -1) {
    state.playListGroup[0].songs.push(song);
    state.playListGroup[0].songIndex = state.playListGroup[0].songs.length - 1;
  } else {
    state.playListGroup[0].songIndex = existIdx;
  }
  state.groupIndex = 0;
}

import type { PlayerState, SongInfo } from '@/types/player';
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

const defaultPlayerState: PlayerState = {
  playListGroup: [
    {
      name: '默认歌单',
      songs: [],
      songIndex: 0,
      canDelete: false,
    },
  ],
  groupIndex: 0,
  playMode: 'order',
};

export const usePlayerStore = defineStore('player', () => {
  const STORAGE_KEY = 'player';
  let loadedState: Partial<PlayerState> = {};
  try {
    loadedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {}
  // 只持久化歌单、groupIndex、playMode
  const state = ref<PlayerState>({ ...defaultPlayerState, ...loadedState });

  watch(
    state,
    (newState) => {
      document.title = currentSong.value ? `Lyra - ${currentSong?.value?.name}` : 'Lyra';
      const { playListGroup, groupIndex, playMode } = newState;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ playListGroup, groupIndex, playMode }));
    },
    { deep: true }
  );

  const currentSong = computed(() => {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || !group.songs.length) return null;
    const idx = group.songIndex ?? 0;
    return group.songs[idx] || null;
  });

  // 播放/暂停由组件管理
  function play() {}

  function pause() {}

  // 下一首
  function next() {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || group.songs.length === 0) return;
    const len = group.songs.length;
    if (len === 1) {
      group.songIndex = 0;
    } else if (state.value.playMode === 'random') {
      let idx = Math.floor(Math.random() * len);
      if (idx === group.songIndex && len > 1) idx = (idx + 1) % len;
      group.songIndex = idx;
    } else {
      group.songIndex = (group.songIndex + 1) % len;
    }
    // 由组件控制播放
  }

  // 上一首
  function prev() {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || group.songs.length === 0) return;
    const len = group.songs.length;
    if (len === 1) {
      group.songIndex = 0;
    } else if (state.value.playMode === 'random') {
      let idx = Math.floor(Math.random() * len);
      if (idx === group.songIndex && len > 1) idx = (idx + 1) % len;
      group.songIndex = idx;
    } else {
      group.songIndex = (group.songIndex - 1 + len) % len;
    }
    // 由组件控制播放
  }

  // 歌曲播放结束时调用
  function onSongEnded() {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || group.songs.length === 0) return;
    if (state.value.playMode === 'repeat') {
      // 单曲循环
      // 不变，重播
      // 由组件控制单曲循环播放
    } else if (state.value.playMode === 'random') {
      next();
    } else {
      // 顺序播放
      if (group.songs.length === 1) {
        // 由组件控制单曲循环播放
      } else if (group.songIndex === group.songs.length - 1) {
        group.songIndex = 0;
        // 由组件控制播放
      } else {
        next();
      }
    }
  }

  return {
    state,
    currentSong,
    play,
    pause,
    next,
    prev,
    onSongEnded,
  };
});

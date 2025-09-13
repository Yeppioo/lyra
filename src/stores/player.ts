// 设置当前播放歌曲，自动初始化播放列表等
import { functions as neteaseGetSong } from '@/api/netease/getSong';
import { functions as neteaseGetLyric } from '@/api/netease/getLyric';
// 设置当前播放歌曲，自动初始化播放列表等
export function setCurrentSong(
  song: PlayingSongInfo,
  playerStore: ReturnType<typeof usePlayerStore>
) {
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
      canDelete: true, // 将默认歌单的 canDelete 设置为 true
    });
  }
  if (!state.playListGroup[0].songs) {
    state.playListGroup[0].songs = [];
  }
  // 检查是否已存在该歌曲
  const existIdx = state.playListGroup[0].songs.findIndex((s: PlayingSongInfo) => s.id === song.id);
  if (existIdx === -1) {
    state.playListGroup[0].songs.push(song);
    state.playListGroup[0].songIndex = state.playListGroup[0].songs.length - 1;
  } else {
    state.playListGroup[0].songIndex = existIdx;
  }
  state.groupIndex = 0;
  playerStore.currentSongId = song.id; // 设置当前歌曲ID，触发异步获取URL和歌词
}

import type { PlayerState, PlayingSongInfo, CurrentSong } from '@/types/player';
import { defineStore } from 'pinia';
import { ref, watch, shallowRef } from 'vue';

const defaultPlayerState: PlayerState = {
  playListGroup: [
    {
      name: '默认歌单',
      songs: [],
      songIndex: 0,
      canDelete: true, // 将默认歌单的 canDelete 设置为 true
    },
  ],
  groupIndex: 0,
  playMode: 'order',
  volume: 50, // 默认音量
  currentSong: null, // 新增 currentSong 属性
};

export const usePlayerStore = defineStore('player', () => {
  const STORAGE_KEY = 'player';
  let loadedState: Partial<PlayerState> = {};
  try {
    loadedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {}
  // 只持久化歌单、groupIndex、playMode
  const state = ref<PlayerState>({ ...defaultPlayerState, ...loadedState });
  const currentSongId = ref<number | null>(null); // 用于监听歌曲ID变化
  const currentSong = shallowRef<CurrentSong | null>(null); // 使用 shallowRef 避免深度响应式开销
  const volume = ref(loadedState.volume ?? defaultPlayerState.volume); // 音量

  // 页面加载时，如果 localStorage 中有歌曲，设置 currentSongId
  if (loadedState.playListGroup && loadedState.playListGroup.length > 0) {
    const group = loadedState.playListGroup[loadedState.groupIndex ?? 0];
    if (group && group.songs.length > 0) {
      currentSongId.value = group.songs[group.songIndex ?? 0]?.id ?? null;
    }
  }

  let abortController: AbortController | null = null; // 用于取消之前的请求

  watch(
    currentSongId,
    async (newId, oldId) => {
      if (newId === null) {
        currentSong.value = null;
        return;
      }

      // 如果歌曲ID相同，则不重新获取
      if (newId === oldId && currentSong.value?.id === newId && currentSong.value?.url) {
        return;
      }

      // 取消之前的请求
      if (abortController) {
        abortController.abort();
      }
      abortController = new AbortController();
      const signal = abortController.signal;

      // 获取歌曲基础信息
      const group = state.value.playListGroup[state.value.groupIndex];
      const songInfo = group?.songs.find((s) => s.id === newId);

      if (!songInfo) {
        currentSong.value = null;
        return;
      }

      // 初始化 currentSong，先设置基础信息
      currentSong.value = {
        ...songInfo,
        url: '', // 初始为空
        lyric: '', // 初始为空
        currentTime: 0,
      };

      // 异步获取歌曲URL和歌词
      try {
        const [songUrlResponse, lyricResponse] = await Promise.allSettled([
          neteaseGetSong.getSongUrl(newId, 999000),
          neteaseGetLyric.getLyric(newId),
        ]);

        // 检查请求是否已被取消
        if (signal.aborted) {
          console.log(`请求已取消，歌曲ID: ${newId}`);
          return;
        }

        // 如果在请求过程中歌曲已切换，则放弃当前结果
        if (currentSongId.value !== newId) {
          console.log(`歌曲已切换，放弃旧请求结果，歌曲ID: ${newId}`);
          return;
        }

        // 处理歌曲URL
        if (songUrlResponse.status === 'fulfilled' && songUrlResponse.value.data.length > 0) {
          const url = songUrlResponse.value.data[0].url;
          if (url) {
            currentSong.value = { ...currentSong.value, url };
          }
        } else {
          console.error('获取歌曲URL失败:', (songUrlResponse as PromiseRejectedResult).reason);
        }

        // 处理歌词
        if (lyricResponse.status === 'fulfilled' && lyricResponse.value.lrc?.lyric) {
          const lyric = lyricResponse.value.lrc.lyric;
          currentSong.value = { ...currentSong.value, lyric };
        } else if (lyricResponse.status === 'rejected') {
          console.error('获取歌词失败:', (lyricResponse as PromiseRejectedResult).reason);
        }
      } catch (error) {
        if (signal.aborted) {
          console.log(`请求已取消，歌曲ID: ${newId}`);
        } else {
          console.error('获取歌曲URL或歌词时发生错误:', error);
        }
      }
    },
    { immediate: true }
  ); // 立即执行一次，处理初始 currentSongId

  // 监听 currentSong 的变化来更新 document.title
  watch(
    currentSong,
    (newSong) => {
      document.title = newSong ? `Lyra - ${newSong.name}` : 'Lyra';
    },
    { immediate: true }
  );

  // 只持久化歌单、groupIndex、playMode
  watch(
    state,
    (newState) => {
      const { playListGroup, groupIndex, playMode } = newState;
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ playListGroup, groupIndex, playMode, volume: volume.value })
      );
    },
    { deep: true }
  );

  // 监听 volume 变化，持久化
  watch(volume, (newVolume) => {
    const { playListGroup, groupIndex, playMode } = state.value;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ playListGroup, groupIndex, playMode, volume: newVolume })
    );
  });

  // currentSong 现在是 ref，不再是 computed
  // 播放/暂停由组件管理

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
    currentSongId.value = group.songs[group.songIndex].id; // 更新 currentSongId
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
    currentSongId.value = group.songs[group.songIndex].id; // 更新 currentSongId
  }

  // 歌曲播放结束时调用
  function onSongEnded() {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || group.songs.length === 0) return;

    switch (state.value.playMode) {
      case 'repeat':
        // 单曲循环，无需操作，由 audio 标签的 loop 属性控制
        break;
      case 'random':
        next();
        break;
      case 'order':
        if (group.songs.length === 1) {
          // 单曲循环，无需操作
        } else if (group.songIndex === group.songs.length - 1) {
          // 歌单内最后一首，从头开始
          group.songIndex = 0;
          currentSongId.value = group.songs[group.songIndex].id;
        } else {
          next();
        }
        break;
      case 'single':
        // 单曲播放，播放完停止，不进行任何操作
        break;
      case 'list':
        if (group.songIndex === group.songs.length - 1) {
          // 当前歌单播放完毕，切换到下一个歌单
          if (state.value.groupIndex < state.value.playListGroup.length - 1) {
            state.value.groupIndex++;
            const nextGroup = state.value.playListGroup[state.value.groupIndex];
            if (nextGroup && nextGroup.songs.length > 0) {
              nextGroup.songIndex = 0;
              currentSongId.value = nextGroup.songs[nextGroup.songIndex].id;
            } else {
              // 下一个歌单为空，停止播放
              currentSongId.value = null;
            }
          } else {
            // 所有歌单播放完毕，停止播放
            currentSongId.value = null;
          }
        } else {
          // 当前歌单未播放完毕，播放下一首
          next();
        }
        break;
    }
  }

  function deleteSong(songId: number, groupIndex: number) {
    const group = state.value.playListGroup[groupIndex];
    if (!group) return;

    const songIndex = group.songs.findIndex((s) => s.id === songId);
    if (songIndex !== -1) {
      const isCurrentSong = currentSongId.value === songId && state.value.groupIndex === groupIndex;
      group.songs.splice(songIndex, 1);

      if (isCurrentSong) {
        if (group.songs.length > 0) {
          // 如果删除的是当前播放歌曲，且歌单中还有其他歌曲
          // 尝试播放下一首，如果删除的是最后一首，则播放新的第一首
          group.songIndex = Math.min(songIndex, group.songs.length - 1);
          currentSongId.value = group.songs[group.songIndex].id;
        } else {
          // 如果歌单为空，则清空当前播放歌曲
          currentSongId.value = null;
        }
      } else if (groupIndex === state.value.groupIndex && songIndex < group.songIndex) {
        // 如果删除的歌曲在当前播放歌曲之前，则当前播放歌曲的索引需要减1
        group.songIndex--;
      }
    }
  }

  function switchPlaylist(newGroupIndex: number) {
    if (newGroupIndex < 0 || newGroupIndex >= state.value.playListGroup.length) return;

    state.value.groupIndex = newGroupIndex;
    const newGroup = state.value.playListGroup[newGroupIndex];
    if (newGroup && newGroup.songs.length > 0) {
      newGroup.songIndex = 0; // 切换歌单后从第一首开始播放
      currentSongId.value = newGroup.songs[newGroup.songIndex].id;
    } else {
      currentSongId.value = null;
    }
  }

  return {
    state,
    currentSong,
    currentSongId, // 暴露 currentSongId
    play,
    pause,
    next,
    prev,
    onSongEnded,
    volume,
    setVolume: (val: number) => (volume.value = val),
    setPlayMode: (mode: 'order' | 'repeat' | 'random' | 'single' | 'list') =>
      (state.value.playMode = mode),
    deleteSong, // 暴露 deleteSong action
    switchPlaylist, // 暴露 switchPlaylist action
  };
});

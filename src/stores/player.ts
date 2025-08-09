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
import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';

export interface SongInfo {
  id: number;
  duration: number;
  name: string;
  artist: string;
  url: string;
  cover: string;
  lyric: string;
  currentTime: number;
}

export interface PlayListGroup {
  name: string;
  songs: SongInfo[];
  songIndex: number;
  neteaseId?: number;
  canDelete: boolean;
}

export interface PlayerState {
  playListGroup: PlayListGroup[];
  groupIndex: number;
  isPlaying: boolean;
  playMode: 'order' | 'repeat' | 'random';
}

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
  isPlaying: false,
  playMode: 'order',
};

export const usePlayerStore = defineStore('player', () => {
  const STORAGE_KEY = 'player';
  let loadedState: Partial<PlayerState> = {};
  try {
    loadedState = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {}
  const state = ref<PlayerState>({ ...defaultPlayerState, ...loadedState });

  watch(
    state,
    (newState) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
    },
    { deep: true }
  );

  const currentSong = computed(() => {
    const group = state.value.playListGroup[state.value.groupIndex];
    if (!group || !group.songs.length) return null;
    const idx = group.songIndex ?? 0;
    return group.songs[idx] || null;
  });

  return {
    state,
    currentSong,
  };
});

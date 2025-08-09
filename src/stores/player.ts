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

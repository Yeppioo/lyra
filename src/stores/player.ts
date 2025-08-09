import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export interface SongInfo {
  id: number;
  duration: number;
  name: string;
  artist: string;
  url: string;
  cover: string;
}

export interface PlayListGroup {
  name: string;
  songs: SongInfo[];
  neteaseId?: number;
}

export interface PlayerState {
  playListGroup: PlayListGroup[];
  playIndex: number;
  currentSong: SongInfo | null;
  isPlaying: boolean;
  audioUrl: string;
  coverUrl: string;
  lyric: string;
  playMode: 'order' | 'repeat' | 'random';
  currentTime: number;
  duration: number;
}

const defaultPlayerState: PlayerState = {
  playListGroup: [],
  currentTime: 0,
  duration: 0,
  playIndex: 0,
  currentSong: null,
  isPlaying: false,
  audioUrl: '',
  coverUrl: '',
  lyric: '',
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

  return {
    state,
  };
});

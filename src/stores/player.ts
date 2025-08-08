import { defineStore } from 'pinia';

export interface SongInfo {
  name: string;
  artist: string;
  url: string;
  cover?: string;
  lyric?: string;
  id?: string | number;
}

export const usePlayerStore = defineStore('player', {
  state: () => ({
    playList: [] as SongInfo[],
    playIndex: -1,
    currentSong: null as SongInfo | null,
    isPlaying: false,
    audioUrl: '',
    coverUrl: '',
    lyric: '',
  }),
  actions: {
    setPlayList(list: SongInfo[], startIndex = 0) {
      this.playList = list;
      this.playIndex = startIndex;
      this.currentSong = list[startIndex] || null;
      this.audioUrl = this.currentSong?.url || '';
      this.coverUrl = this.currentSong?.cover || '';
      this.lyric = this.currentSong?.lyric || '';
      this.isPlaying = !!this.audioUrl;
    },
    play(song: SongInfo, index = 0) {
      this.currentSong = song;
      this.playIndex = index;
      this.audioUrl = song.url;
      this.coverUrl = song.cover || '';
      this.lyric = song.lyric || '';
      this.isPlaying = true;
    },
    pause() {
      this.isPlaying = false;
    },
    resume() {
      if (this.audioUrl) this.isPlaying = true;
    },
    next() {
      if (this.playList.length > 0 && this.playIndex < this.playList.length - 1) {
        this.playIndex++;
        this.play(this.playList[this.playIndex], this.playIndex);
      }
    },
    prev() {
      if (this.playList.length > 0 && this.playIndex > 0) {
        this.playIndex--;
        this.play(this.playList[this.playIndex], this.playIndex);
      }
    },
  },
});

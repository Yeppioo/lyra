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
  playMode: 'order' | 'repeat' | 'random';
}

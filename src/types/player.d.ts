export interface SongInfo {
  id: number;
  duration: number;
  name: string;
  artist: ArtistEntry[];
  cover: string;
}

export interface PlayingSongInfo {
  id: number;
  duration: number;
  name: string;
  artist: ArtistEntry[];
  cover: string;
}

export interface ArtistEntry {
  id: number;
  name: string;
}

export interface CurrentSong extends SongInfo {
  url: string;
  lyric: string;
  yrcLyric?: string; // 新增逐字歌词
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
  playMode: 'order' | 'repeat' | 'random' | 'single' | 'list';
  volume: number; // 0-100
  currentSong: CurrentSong | null;
  isPlaying: boolean; // 新增：播放状态
}

export interface Artist {
  id: number;
  cover: string;
  avatar: string;
  name: string;
  transNames: string[];
  alias: string[];
  identities: string[];
  identifyTag: string | null;
  briefDesc: string;
  rank: {
    rank: number;
    type: number;
  };
  albumSize: number;
  musicSize: number;
  mvSize: number;
}

export interface ArtistDetailResponse {
  code: number;
  message: string;
  data: {
    videoCount: number;
    identify: {
      imageUrl: string | null;
      imageDesc: string;
      actionUrl: string;
    };
    artist: Artist;
    blacklist: boolean;
    preferShow: number;
    showPriMsg: boolean;
    secondaryExpertIdentiy: Array<{
      expertIdentiyId: number;
      expertIdentiyName: string;
      expertIdentiyCount: number;
    }>;
  };
}

export interface SongArtist {
  id: number;
  name: string;
  tns?: string[];
  alias?: string[];
}

export interface SongAlbum {
  id: number;
  name: string;
  picUrl: string;
  tns?: string[];
}

export interface Song {
  id: number;
  name: string;
  picUrl: string;
  artists: SongArtist[];
  album: SongAlbum;
  duration: number;
  requireVip: boolean;
  hasMv: boolean;
}

export interface RawSong {
  id: number;
  name: string;
  al: {
    id: number;
    name: string;
    picUrl: string;
    tns?: string[];
  };
  ar: Array<{
    id: number;
    name: string;
    tns?: string[];
    alias?: string[];
  }>;
  dt: number;
  fee: number;
  mv: number;
}

export interface ArtistSongsResponse {
  code: number;
  songs: RawSong[];
  total: number;
}

export interface Album {
  id: number;
  name: string;
  picUrl: string;
  publishTime: number;
  // ... 其他专辑属性
}

export interface ArtistAlbumResponse {
  code: number;
  hotAlbums: Album[];
  total: number;
  more: boolean;
}

export interface MV {
  id: number;
  name: string;
  imgurl: string;
  artistName: string;
  // ... 其他MV属性
}

export interface ArtistMvResponse {
  code: number;
  mvs: MV[];
  size: number;
  hasMore: boolean;
}

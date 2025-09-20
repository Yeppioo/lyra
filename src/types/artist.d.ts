/* eslint-disable @typescript-eslint/no-explicit-any */
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

export interface ArtistTopSongResponse {
  code: number;
  more: boolean;
  songs: Song[];
}

export interface Song {
  name: string;
  mainTitle: null | string;
  additionalTitle: AdditionalTitle | null;
  id: number;
  pst: number;
  t: number;
  ar: Ar[];
  alia: string[];
  pop: number;
  st: number;
  rt: null | string;
  fee: number;
  v: number;
  crbt: null;
  cf: string;
  al: Al;
  dt: number;
  h: H;
  m: H;
  l: H | null;
  sq: H | null;
  hr: null;
  a: null;
  cd: string;
  no: number;
  rtUrl: null;
  ftype: number;
  rtUrls: any[];
  djId: number;
  copyright: number;
  s_id: number;
  mark: number;
  originCoverType: number;
  originSongSimpleData: OriginSongSimpleData | null;
  tagPicList: null;
  resourceState: boolean;
  version: number;
  songJumpInfo: null;
  entertainmentTags: null;
  awardTags: null;
  displayTags: null;
  single: number;
  noCopyrightRcmd: null;
  mv: number;
  rtype: number;
  rurl: null;
  mst: number;
  cp: number;
  publishTime: number;
  privilege: Privilege;
  awardName?: AwardName;
}

export interface Al {
  id: number;
  name: string;
  picUrl: string;
  tns: any[];
  pic_str?: string;
  pic: number;
}

export interface Ar {
  id: number;
  name: string;
  tns: any[];
  alias: any[];
}

export interface H {
  br: number;
  fid: number;
  size: number;
  vd: number;
  sr: number;
}

export interface OriginSongSimpleData {
  songId: number;
  name: string;
  artists: AlbumMeta[];
  albumMeta: AlbumMeta;
}

export interface AlbumMeta {
  id: number;
  name: string;
}

export interface Privilege {
  id: number;
  fee: number;
  payed: number;
  st: number;
  pl: number;
  dl: number;
  sp: number;
  cp: number;
  subp: number;
  cs: boolean;
  maxbr: number;
  fl: number;
  toast: boolean;
  flag: number;
  preSell: boolean;
  playMaxbr: number;
  downloadMaxbr: number;
  maxBrLevel: MaxBrLevel;
  playMaxBrLevel: MaxBrLevel;
  downloadMaxBrLevel: MaxBrLevel;
  plLevel: LLevel;
  dlLevel: DLLevel;
  flLevel: LLevel;
  rscl: null;
  freeTrialPrivilege: FreeTrialPrivilege;
  rightSource: number;
  chargeInfoList: ChargeInfoList[];
  code: number;
  message: null;
  plLevels: null;
  dlLevels: null;
  ignoreCache: IgnoreCache;
  bd: null;
}

export interface ChargeInfoList {
  rate: number;
  chargeUrl: null;
  chargeMessage: null;
  chargeType: number;
}

export interface FreeTrialPrivilege {
  resConsumable: boolean;
  userConsumable: boolean;
  listenType: number;
  cannotListenReason: number;
  playReason: null;
  freeLimitTagType: null;
}

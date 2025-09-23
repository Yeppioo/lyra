export interface UserDetailResponse {
  code: number;
  profile: UserProfile;
  level: number;
  listenSongs: number;
  createTime: number;
  createDays: number;
  bindings: UserBinding[];
  adValid: boolean;
  newUser: boolean;
  recallUser: boolean;
  profileVillageInfo: ProfileVillageInfo;
  identify?: UserIdentify; // Optional, as some users might not be artists
  userPoint: UserPoint;
  mobileSign: boolean;
  pcSign: boolean;
  peopleCanSeeMyPlayRecord: boolean;
}

export interface UserProfile {
  privacyItemUnlimit: PrivacyItemUnlimit;
  avatarDetail: AvatarDetail;
  vipType: number;
  mutual: boolean;
  remarkName: null;
  accountStatus: number;
  province: number;
  gender: number;
  birthday: number;
  city: number;
  followed: boolean;
  nickname: string;
  defaultAvatar: boolean;
  avatarImgId: number;
  avatarUrl: string;
  backgroundImgId: number;
  backgroundUrl: string;
  userType: number;
  detailDescription: string;
  djStatus: number;
  experts: Record<string, unknown>;
  authStatus: number;
  expertTags: null;
  avatarImgIdStr: string;
  backgroundImgIdStr: string;
  description: string;
  createTime: number;
  userId: number;
  signature: string;
  authority: number;
  allAuthTypes: AuthType[];
  followeds: number;
  follows: number;
  blacklist: boolean;
  artistId?: number; // Optional
  eventCount: number;
  allSubscribedCount: number;
  playlistBeSubscribedCount: number;
  mainAuthType?: AuthType; // Optional
  followTime: null;
  followMe: boolean;
  artistIdentity: unknown[];
  cCount: number;
  inBlacklist: boolean;
  sDJPCount: number;
  artistName?: string; // Optional
  playlistCount: number;
  sCount: number;
  newFollows: number;
}

export interface PrivacyItemUnlimit {
  area: boolean;
  college: boolean;
  user_page_profile: boolean;
  gender: boolean;
  age: boolean;
  villageAge: boolean;
}

export interface AvatarDetail {
  userType: null;
  identityLevel: number;
  identityIconUrl: string;
}

export interface AuthType {
  type: number;
  desc: string;
  tags: string[];
}

export interface UserBinding {
  expiresIn: number;
  refreshTime: number;
  bindingTime: number;
  tokenJsonStr: null;
  url: string;
  expired: boolean;
  userId: number;
  id: number;
  type: number;
}

export interface ProfileVillageInfo {
  title: string;
  imageUrl: null;
  targetUrl: string;
}

export interface UserIdentify {
  imageUrl: string;
  imageDesc: string;
  actionUrl: null;
}

export interface UserPoint {
  userId: number;
  balance: number;
  updateTime: number;
  version: number;
  status: number;
  blockBalance: number;
}

export interface UserPlaylistResponse {
  code: number;
  more: boolean;
  playlist: Playlist[];
}

export interface Playlist {
  subscribers: unknown[];
  subscribed: null;
  creator: PlaylistCreator;
  artists: null;
  tracks: null;
  top: boolean;
  updateFrequency: null | string;
  backgroundCoverId: number;
  backgroundCoverUrl: null;
  titleImage: number;
  titleImageUrl: null;
  englishTitle: null;
  opRecommend: boolean;
  recommendInfo: null | RecommendInfo;
  subscribedCount: number;
  cloudTrackCount: number;
  userId: number;
  totalDuration: number;
  coverImgId: number;
  privacy: number;
  trackUpdateTime: number;
  trackCount: number;
  updateTime: number;
  commentThreadId: string;
  coverImgUrl: string;
  specialType: number;
  anonimous: boolean;
  createTime: number;
  highQuality: boolean;
  newImported: boolean;
  trackNumberUpdateTime: number;
  playCount: number;
  adType: number;
  description: null | string;
  tags: string[];
  ordered: boolean;
  status: number;
  name: string;
  id: number;
  coverImgId_str?: string;
  sharedUsers: null;
  shareStatus: null;
  copied: boolean;
  containsTracks: boolean;
}

export interface PlaylistCreator {
  defaultAvatar: boolean;
  province: number;
  authStatus: number;
  followed: boolean;
  avatarUrl: string;
  accountStatus: number;
  gender: number;
  city: number;
  birthday: number;
  userId: number;
  userType: number;
  nickname: string;
  signature: string;
  description: string;
  detailDescription: string;
  avatarImgId: number;
  backgroundImgId: number;
  backgroundUrl: string;
  authority: number;
  mutual: boolean;
  expertTags: null;
  experts: null;
  djStatus: number;
  vipType: number;
  remarkName: null;
  authenticationTypes?: number;
  avatarDetail: null;
  avatarImgIdStr: string;
  backgroundImgIdStr: string;
  anchor: boolean;
  avatarImgId_str?: string;
}

export interface RecommendInfo {
  alg: string;
  logInfo: string;
  reason: null;
  relatedId: string;
  relatedType: string;
  firstSongId: null;
}

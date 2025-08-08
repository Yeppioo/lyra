import { apiSettings } from '../config';
import { h } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { DefaultSearchTip, SearchTipGroup } from '../../types/uiProperties.d';

interface hotResponse {
  searchWord: string;
  iconType: number;
}

interface Artist {
  id: number;
  name: string;
  picUrl: string | null;
  alias: string[];
  albumSize: number;
  picId: number;
  fansGroup: null;
  img1v1Url: string;
  img1v1: number;
  trans: null;
  accountId?: number;
}

interface Album {
  id: number;
  name: string;
  artist: Artist;
  publishTime: number;
  size: number;
  copyrightId: number;
  status: number;
  picId: number;
  mark: number;
}

interface Song {
  id: number;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number;
  copyrightId: number;
  status: number;
  alias: string[];
  rtype: number;
  ftype: number;
  mvid: number;
  fee: number;
  rUrl: null;
  mark: number;
}

interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  creator: null;
  subscribed: boolean;
  trackCount: number;
  userId: number;
  playCount: number;
  bookCount: number;
  specialType: number;
  officialTags: null;
  action: null;
  actionType: null;
  recommendText: null;
  score: null;
  officialPlaylistTitle: null;
  playlistType: string;
  description: string;
  highQuality: boolean;
}

interface SuggestResponse {
  result: {
    albums?: Album[];
    artists?: Artist[];
    songs?: Song[];
    playlists?: Playlist[];
    order: string[];
  };
}

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `realIP=${realIP}` : '';

async function getHotKeyword(): Promise<SearchTipGroup[]> {
  const response = await fetch(`${apiBase}/search/hot/detail?${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return [
    {
      name: '热搜榜',
      items: data.data.map((item: hotResponse, index: number) => ({
        key: item.searchWord,
        iconType: item.iconType,
        rank: index + 1,
      })),
      icon: h(FontAwesomeIcon, { icon: ['fas', 'fire'], size: 'lg' }),
    },
  ];
}

async function getDefaultKey(): Promise<DefaultSearchTip> {
  const response = await fetch(`${apiBase}/search/default?${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return {
    key: data.data.realkeyword,
    show: data.data.showKeyword,
  };
}

async function getSuggestKeyword(
  keywords: string,
  signal?: AbortSignal
): Promise<SearchTipGroup[]> {
  const response = await fetch(`${apiBase}/search/suggest?keywords=${keywords}&${realIpParam}`, {
    signal,
  });
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = (await response.json()) as SuggestResponse;

  const result: SearchTipGroup[] = [];

  if (data.result.order) {
    for (const type of data.result.order) {
      switch (type) {
        case 'songs':
          if (data.result.songs && data.result.songs.length > 0) {
            result.push({
              name: '单曲',
              items: data.result.songs.map((song) => ({
                key: song.name + ' - ' + song.artists.map((artist) => artist.name).join(', '),
                iconType: 0,
                type: 'song',
                obj: song,
              })),
              icon: h(FontAwesomeIcon, { icon: ['fas', 'music'], size: 'lg' }),
            });
          }
          break;

        case 'artists':
          if (data.result.artists && data.result.artists.length > 0) {
            result.push({
              name: '歌手',
              items: data.result.artists.map((artist) => ({
                key: artist.name,
                iconType: 0,
                type: 'artist',
                obj: artist,
              })),
              icon: h(FontAwesomeIcon, { icon: ['fas', 'user'], size: 'lg' }),
            });
          }
          break;

        case 'albums':
          if (data.result.albums && data.result.albums.length > 0) {
            result.push({
              name: '专辑',
              items: data.result.albums.map((album) => ({
                key: album.name + ' - ' + album.artist.name,
                iconType: 0,
                type: 'album',
                obj: album,
              })),
              icon: h(FontAwesomeIcon, { icon: ['fas', 'compact-disc'], size: 'lg' }),
            });
          }
          break;

        case 'playlists':
          if (data.result.playlists && data.result.playlists.length > 0) {
            result.push({
              name: '歌单',
              items: data.result.playlists.map((playlist) => ({
                key: playlist.name,
                iconType: 0,
                type: 'playlist',
                obj: playlist,
              })),
              icon: h(FontAwesomeIcon, { icon: ['fas', 'list-ul'], size: 'lg' }),
            });
          }
          break;
      }
    }
  }

  return result;
}

export const functions = {
  getHotKeyword,
  getDefaultKey,
  getSuggestKeyword,
};

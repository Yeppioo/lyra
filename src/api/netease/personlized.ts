import type { ArtistEntry } from '@/types/player';
import { apiSettings } from '../config';

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `realIP=${realIP}` : '';

interface SongEntry {
  id: number;
  name: string;
  pic: string;
  artist: ArtistEntry[];
  reason: string;
}

export interface PersonalizedEntry {
  song30: {
    songs: SongEntry[];
    selectedindex: number;
    loading: boolean;
  };
}

export async function getPersonalizedSongs(): Promise<SongEntry[]> {
  const response = await fetch(`${apiBase}/recommend/songs?${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  if (!data.data) {
    return [];
  }
  const songs = [];
  for (const song of data.data.dailySongs) {
    const artists = [] as ArtistEntry[];
    for (const artist of song.ar) {
      artists.push({
        id: artist.id,
        name: artist.name,
      });
    }
    songs.push({
      id: song.id,
      name: song.name,
      pic: song.al.picUrl,
      artist: artists,
      reason: song.reason,
    });
  }
  return songs;
}

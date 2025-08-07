import { apiSettings } from '../config';

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `realIP=${realIP}` : '';

interface SongEntry {
  id: number;
  name: string;
  pic: string;
  artist: string[];
  reason: string;
}

export interface PersonalizedEntry {
  song30: SongEntry[];
}

export async function getPersonalizedSongs(): Promise<SongEntry[]> {
  const response = await fetch(`${apiBase}/recommend/songs?${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data || [];
}

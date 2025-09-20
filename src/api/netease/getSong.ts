import { apiSettings } from '../config';

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `realIP=${realIP}` : '';

export interface SongUrlData {
  id: number;
  url: string | null;
  br: number;
  size: number;
  md5: string;
  code: number;
  expi: number;
  type: string;
  gain: number;
  peak: number;
  fee: number;
  uf: null;
  payed: number;
  flag: number;
  canExtend: boolean;
  freeTrialInfo: null;
  level: string;
  encodeType: string;
  freeTrialPrivilege: {
    resConsumable: boolean;
    userConsumable: boolean;
    listenType: null;
    cannotListenReason: null;
    playReason: null;
  };
  freeTimeTrialPrivilege: {
    resConsumable: boolean;
    userConsumable: boolean;
    type: number;
    remainTime: number;
  };
  urlSource: number;
  rightSource: number;
  podcastCtrp: null;
  effectTypes: null;
  time: number;
}

export interface GetSongResponse {
  data: SongUrlData[];
  code: number;
}

/**
 * Get song URL for playback
 * @param id - Song ID to get URL for
 * @param br - Bitrate (default: 999000 for max quality)
 * @returns Promise<GetSongResponse> - Song URL data
 */
async function getSongUrl(id: number, br: number = 999000): Promise<GetSongResponse> {
  try {
    const response = await fetch(`${apiBase}/song/url?id=${id}&br=${br}&${realIpParam}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (data.code !== undefined && data.data !== undefined) {
      return data as GetSongResponse;
    }

    // Fallback for unexpected response format
    throw new Error('Invalid response format from song URL API');
  } catch (error) {
    console.error('Error fetching song URL:', error);
    throw error;
  }
}

/**
 * Get multiple song URLs for playback
 * @param ids - Array of song IDs to get URLs for
 * @param br - Bitrate (default: 999000 for max quality)
 * @returns Promise<GetSongResponse> - Song URL data for multiple songs
 */
async function getSongUrls(ids: string[], br: number = 999000): Promise<GetSongResponse> {
  try {
    const idsParam = ids.join(',');
    const response = await fetch(`${apiBase}/song/url?id=${idsParam}&br=${br}&${realIpParam}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (data.code !== undefined && data.data !== undefined) {
      return data as GetSongResponse;
    }

    // Fallback for unexpected response format
    throw new Error('Invalid response format from song URL API');
  } catch (error) {
    console.error('Error fetching song URLs:', error);
    throw error;
  }
}

async function getSongPics(ids: string[]): Promise<string[]> {
  try {
    const idsParam = ids.join(',');
    const response = await fetch(`${apiBase}/song/detail?ids=${idsParam}&${realIpParam}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Validate response structure
    if (data.code !== undefined && data.data !== undefined) {
      return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.songs.map((song: any) => song.al.picUrl);
  } catch (error) {
    console.error('Error fetching song URLs:', error);
    throw error;
  }
}

export const functions = {
  getSongUrl,
  getSongUrls,
  getSongPics,
};

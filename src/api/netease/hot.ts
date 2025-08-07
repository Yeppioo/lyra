import { apiSettings } from '../config';
const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `&realIP=${realIP}` : '';

export type HotKeyword = {
  searchWord: string;
  iconType: number;
};

async function getHotKeyword(): Promise<HotKeyword[]> {
  const response = await fetch(`${apiBase}/search/hot/detail${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return data.data;
}

export const functions = {
  getHotKeyword,
};

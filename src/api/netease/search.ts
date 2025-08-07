import { apiSettings } from '../config';
import type { SearchTipGroup } from '../../components/SearcherBox.vue';
import { h } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface hotResponse {
  searchWord: string;
  iconType: number;
}

const { neteaseApiBase: apiBase, realIP } = apiSettings;
const realIpParam = realIP ? `&realIP=${realIP}` : '';

async function getHotKeyword(): Promise<SearchTipGroup[]> {
  const response = await fetch(`${apiBase}/search/hot/detail${realIpParam}`);
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

async function getDefaultKey(): Promise<SearchTipGroup[]> {
  const response = await fetch(`${apiBase}/search/hot/detail${realIpParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return [
    {
      name: '热搜榜',
      items: data.data.map((item: hotResponse, index: number) => ({}))
    }
  ]
}


export const functions = {
  getHotKeyword,
};

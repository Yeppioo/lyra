import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPersonalizedSongs } from '../api/netease/personlized';
import type { UIPropertiesState } from '../types/uiProperties.d';
import { functions as searchApi } from '../api/netease/search';

const defaultUIProperties: UIPropertiesState = {
  personalized: {
    song30: [],
  },
  defaultSearchKey: { key: '', show: '搜索...' },
  hotSearchTips: [],
};

export const useUIPropertiesStore = defineStore('uiProperties', () => {
  const uiProperties = ref<UIPropertiesState>({ ...defaultUIProperties });

  async function fetchPersonalizedSongs(): Promise<void> {
    try {
      getPersonalizedSongs()
        .then((data) => {
          console.log('获取推荐歌曲成功：', data);
          uiProperties.value.personalized.song30 = data || [];
        })
        .catch((error) => {
          console.error('Failed to fetch personalized songs:', error);
        });
    } catch (error) {
      console.error('Failed to fetch personalized songs:', error);
    }
  }

  async function fetchSearchData(): Promise<void> {
    try {
      searchApi
        .getHotKeyword()
        .then((data) => {
          uiProperties.value.hotSearchTips = data || [];
        })
        .catch((error) => {
          console.error('Failed to fetch hot search keywords:', error);
        });

      searchApi
        .getDefaultKey()
        .then((data) => {
          uiProperties.value.defaultSearchKey = data || { key: '', show: '搜索...' };
        })
        .catch((error) => {
          console.error('Failed to fetch default search key:', error);
        });
    } catch (error) {
      console.error('Failed to fetch search data:', error);
    }
  }

  return {
    uiProperties,
    fetchPersonalizedSongs,
    fetchSearchData,
  };
});

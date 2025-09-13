import { defineStore } from 'pinia';
import { ref } from 'vue';
import { getPersonalizedSongs } from '../api/netease/personlized';
import type { UIPropertiesState } from '../types/uiProperties';
import { functions as searchApi } from '../api/netease/search';

const defaultUIProperties: UIPropertiesState = {
  personalized: {
    song30: {
      songs: [],
      loading: true,
      selectedindex: 0,
    },
  },
  defaultSearchKey: { key: '', show: '搜索...' },
  hotSearchTips: [],
  showFullScreenLyrics: false, // 新增：控制全屏歌词显示状态
  isFullScreen: false, // 新增：控制网页全屏状态
};

export const useUIPropertiesStore = defineStore('uiProperties', () => {
  const uiProperties = ref<UIPropertiesState>({ ...defaultUIProperties });
  const isFullScreen = ref(false); // 单独管理全屏状态

  function toggleFullScreenLyrics(visible?: boolean) {
    if (typeof visible === 'boolean') {
      uiProperties.value.showFullScreenLyrics = visible;
    } else {
      uiProperties.value.showFullScreenLyrics = !uiProperties.value.showFullScreenLyrics;
    }
  }

  function toggleFullScreen() {
    isFullScreen.value = !isFullScreen.value;
    if (isFullScreen.value) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  async function fetchPersonalizedSongs(): Promise<void> {
    try {
      getPersonalizedSongs()
        .then((data) => {
          console.log('获取推荐歌曲成功：', data);
          uiProperties.value.personalized.song30.songs = data || [];
          if (data && data.length > 0) {
            uiProperties.value.personalized.song30.loading = false;
          }
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
    isFullScreen, // 暴露 isFullScreen 状态
    fetchPersonalizedSongs,
    fetchSearchData,
    toggleFullScreenLyrics, // 暴露方法
    toggleFullScreen, // 暴露全屏切换方法
  };
});

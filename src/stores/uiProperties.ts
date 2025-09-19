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
  loginMessage: '', // 新增：登录消息
  showLoginMessage: false, // 新增：控制登录消息显示状态
  loginStatus: 'idle', // 新增：登录状态
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

  function setLoginMessage(message: string, show: boolean = true) {
    uiProperties.value.loginMessage = message;
    uiProperties.value.showLoginMessage = show;
  }

  function setShowLoginMessage(show: boolean) {
    uiProperties.value.showLoginMessage = show;
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
    fetchPersonalizedSongs,
    fetchSearchData,
    toggleFullScreenLyrics, // 暴露方法
    toggleFullScreen, // 暴露全屏切换方法
    setLoginMessage, // 暴露设置登录消息的方法
    setShowLoginMessage, // 暴露设置登录消息显示状态的方法
    loginStatus: uiProperties.value.loginStatus, // 暴露登录状态
  };
});

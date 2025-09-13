import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { UserAccountResponse } from '@/api/netease/login';

export interface SettingsState {
  theme: 'light' | 'dark';
  volume: number;
  searchHistory: string[];
  userinfo: {
    state: string[];
    username: string | null; // 将通过 netease.profile.nickname 获取
    avatar: string | null; // 将通过 netease.profile.avatarUrl 获取
    netease: {
      cookie: string | null;
      account: UserAccountResponse['account'] | null;
      profile: UserAccountResponse['profile'] | null;
    };
  };
}

const defaultSettings: SettingsState = {
  theme: 'light',
  volume: 0.8,
  searchHistory: [],
  userinfo: {
    state: [],
    username: '未登录',
    avatar: null,
    netease: {
      cookie: null,
      account: null,
      profile: null,
    },
  },
};

export const useSettingsStore = defineStore('settings', () => {
  const loadedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
  if (loadedSettings.theme === 'auto') {
    loadedSettings.theme = 'light';
  }
  const settings = ref<SettingsState>({ ...defaultSettings, ...loadedSettings });

  watch(
    settings,
    (newSettings) => {
      localStorage.setItem('settings', JSON.stringify(newSettings));
    },
    { deep: true }
  );

  watch(
    () => settings.value.theme,
    (theme) => {
      if (theme === 'dark') {
        document.documentElement.setAttribute('theme-dark', '');
      } else {
        document.documentElement.removeAttribute('theme-dark');
      }
    },
    { immediate: true }
  );

  return {
    settings,
    updateUserInfo(profile: UserAccountResponse['profile']) {
      settings.value.userinfo.username = profile.nickname;
      settings.value.userinfo.avatar = profile.avatarUrl;
    },
  };
});

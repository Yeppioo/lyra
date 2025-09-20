import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { UserAccountResponse, LoginStatusResponse } from '@/api/netease/login';
import { functions as neteaseLoginApi } from '@/api/netease/login';
import { useUIPropertiesStore } from './uiProperties'; // 导入 useUIPropertiesStore

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

  async function checkLoginStatus(
    uiPropertiesStore: ReturnType<typeof useUIPropertiesStore>
  ): Promise<void> {
    // 如果本地没有账户信息，则跳过登录状态检查
    if (!settings.value.userinfo.netease.account) {
      console.log('本地无账户信息，跳过登录状态检查');
      uiPropertiesStore.uiProperties.loginStatus = 'idle'; // 保持idle状态或设置为未登录
      return;
    }

    uiPropertiesStore.uiProperties.loginStatus = 'loggingIn';
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const response: LoginStatusResponse = await neteaseLoginApi.getLoginStatus();
        if (response.data.code === 200) {
          if (
            response.data.profile &&
            response.data.account &&
            !response.data.account.anonimousUser
          ) {
            settings.value.userinfo.netease.account = response.data.account;
            settings.value.userinfo.netease.profile = response.data.profile;
            settings.value.userinfo.username = response.data.profile.nickname;
            settings.value.userinfo.avatar = response.data.profile.avatarUrl;
            uiPropertiesStore.uiProperties.loginStatus = 'loggedIn';
            return;
          } else {
            // 匿名用户或未登录，清空本地存储的账户信息
            settings.value.userinfo.netease.account = null;
            settings.value.userinfo.netease.profile = null;
            settings.value.userinfo.username = '未登录';
            settings.value.userinfo.avatar = null;
            uiPropertiesStore.uiProperties.loginStatus = 'loginExpired';
            console.log('登录过期或未登录，已清空本地账户信息', response.data);
            window.location.reload(); // 触发页面刷新
            return;
          }
        } else {
          console.warn(`登录状态检查失败，API返回码: ${response.data.code}`);
        }
      } catch (error) {
        console.error(`登录状态检查网络错误 (尝试 ${attempts + 1}/${maxAttempts}):`, error);
      }
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 等待1秒后重试
      }
    }
    uiPropertiesStore.uiProperties.loginStatus = 'loginFailed';
    console.error('登录状态检查失败，已达最大重试次数');
  }

  return {
    settings,
    updateUserInfo(profile: UserAccountResponse['profile']) {
      settings.value.userinfo.username = profile.nickname;
      settings.value.userinfo.avatar = profile.avatarUrl;
    },
    checkLoginStatus, // 暴露 checkLoginStatus action
  };
});

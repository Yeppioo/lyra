/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PersonalizedEntry } from '../api/netease/personlized';

export interface UIPropertiesState {
  personalized: PersonalizedEntry;
  defaultSearchKey: DefaultSearchTip;
  hotSearchTips: SearchTipGroup[];
  showFullScreenLyrics: boolean; // 新增：控制全屏歌词显示状态
  isFullScreen: boolean; // 新增：控制网页全屏状态
  loginMessage: string; // 新增：登录消息
  showLoginMessage: boolean; // 新增：控制登录消息显示状态
  loginStatus: 'idle' | 'loggingIn' | 'loggedIn' | 'loginFailed' | 'loginExpired'; // 登录状态
}

import type { VNode } from 'vue';

export interface DefaultSearchTip {
  key: string;
  show: string;
}

export interface SearchTipGroup {
  name: string;
  items: SearchTipEntry[];
  icon: VNode;
}

export interface SearchTipEntry {
  key: string;
  type: 'hot' | 'album' | 'artist' | 'song' | 'playlist' | 'string' | 'keyword';
  obj?: any;
  iconType?: number;
  rank?: number;
}

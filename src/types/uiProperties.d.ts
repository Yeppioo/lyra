import type { PersonalizedEntry } from '../api/netease/personlized';

export interface UIPropertiesState {
  personalized: PersonalizedEntry;
  // 待补充其他UI属性
  defaultSearchKey: DefaultSearchTip;
  hotSearchTips: SearchTipGroup[];
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
  type: 'hot' | 'album' | 'artist' | 'song' | 'playlist' | 'string';
  obj: unknown;
  iconType: number;
  rank?: number;
}

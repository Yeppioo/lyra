import { h, type VNode } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export interface NavItem {
  key: string;
  label: string;
  title: string;
  icon: () => VNode;
}

export const navConfig: NavItem[] = [
  {
    key: '/',
    icon: () => h(FontAwesomeIcon, { icon: ['fas', 'compass'] }),
    label: '推荐',
    title: '推荐',
  },
  {
    label: '排行',
    title: '排行',
    key: '/rank',
    icon: () => h(FontAwesomeIcon, { icon: ['fas', 'ranking-star'] }),
  },
];

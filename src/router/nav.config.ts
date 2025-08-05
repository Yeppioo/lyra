import type { MenuProps } from 'ant-design-vue'
import { h } from 'vue'

export const navConfig: MenuProps['items'] = [
  {
    key: '/',
    icon: () => h('i', { class: 'fas fa-compass' }),
    label: '推荐',
    title: '推荐',
  },
  {
    label: '排行',
    title: '排行',
    key: '/rank',
    icon: () => h('i', { class: 'fas fa-compass' }),
  },
]

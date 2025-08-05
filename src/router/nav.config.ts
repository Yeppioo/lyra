export interface NavItem {
  name: string
  path: string
  icon: string[]
}

export const navConfig: NavItem[] = [
  {
    name: '推荐',
    path: '/',
    icon: ['fas fa-compass'],
  },
  {
    name: '排行',
    path: '/rank',
    icon: ['fas fa-house'],
  },
  {
    name: '我的',
    path: '/my',
    icon: ['fas fa-house'],
  },
]

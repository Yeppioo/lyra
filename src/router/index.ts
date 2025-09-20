import { createRouter, createWebHistory } from 'vue-router';
import { useSettingsStore } from '@/stores/settings';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
    },
    {
      path: '/album/:key',
      name: 'album-view',
      component: () => import('../views/AlbumView.vue'),
    },
    {
      path: '/song/:key',
      name: 'song-view',
      component: () => import('../views/SongView.vue'),
    },
    {
      path: '/video/:key',
      name: 'video-view',
      component: () => import('../views/VideoView.vue'),
    },
    {
      path: '/auth/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('../views/SearchView.vue'),
      props: true,
      children: [
        {
          path: 'songs/:key',
          name: 'search-songs',
          component: () => import('../components/search/songs.vue'),
          props: true,
        },
        {
          path: 'artists/:key',
          name: 'search-artists',
          component: () => import('../components/search/artists.vue'),
          props: true,
        },
        {
          path: 'albums/:key',
          name: 'search-albums',
          component: () => import('../components/search/albums.vue'),
          props: true,
        },
        {
          path: 'videos/:key',
          name: 'search-videos',
          component: () => import('../components/search/videos.vue'),
          props: true,
        },
        {
          path: 'playlist/:key',
          name: 'search-playlist',
          component: () => import('../components/search/playlists.vue'),
          props: true,
        },
      ],
    },
    {
      path: '/artist/:key',
      name: 'artist',
      component: () => import('../views/ArtistView.vue'),
      props: true,
      children: [
        {
          path: 'song',
          name: 'song',
          component: () => import('../components/artist/hot-song.vue'),
          props: true,
        },
        {
          path: 'album',
          name: 'album',
          component: () => import('../components/artist/album.vue'),
          props: true,
        },
        {
          path: 'mv',
          name: 'mv',
          component: () => import('../components/artist/mv.vue'),
          props: true,
        },
        {
          path: 'all-song',
          name: 'all-song',
          component: () => import('../components/artist/all-song.vue'),
          props: true,
        },
      ],
    },
  ],
});

router.beforeEach((to, from, next) => {
  const settingsStore = useSettingsStore();
  const isLoggedIn = !!settingsStore.settings.userinfo.netease.cookie;

  if (to.path === '/auth/login' && isLoggedIn) {
    next('/'); // 如果已登录且尝试访问登录页，则重定向到主页
  } else {
    next(); // 否则正常导航
  }
});

export default router;

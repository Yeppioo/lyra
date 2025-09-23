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
      props: true,
    },
    {
      path: '/song/:key/comment',
      name: 'song-comment',
      component: () => import('../views/comment/SongComment.vue'),
      props: true,
    },
    {
      path: '/video/:key',
      name: 'video-view',
      component: () => import('../views/VideoView.vue'),
    },
    {
      path: '/playlist/:key',
      name: 'playlist-view',
      component: () => import('../views/PlaylistView.vue'),
    },
    {
      path: '/user/:key',
      name: 'user-view',
      component: () => import('../views/UserView.vue'),
      props: true,
      children: [
        {
          path: '',
          redirect: (to) => {
            return { path: `/user/${to.params.key}/created-playlists` };
          },
        },
        {
          path: 'created-playlists',
          name: 'created-playlists',
          component: () => import('../components/common/PlaylistGrid.vue'), // Placeholder, actual component will be in UserView
          props: true,
        },
        {
          path: 'subscribed-playlists',
          name: 'subscribed-playlists',
          component: () => import('../components/common/PlaylistGrid.vue'), // Placeholder, actual component will be in UserView
          props: true,
        },
        {
          path: 'notes',
          name: 'notes',
          component: () => import('../views/UserView.vue'), // Placeholder, actual component will be in UserView
          props: true,
        },
        {
          path: 'podcasts',
          name: 'podcasts',
          component: () => import('../views/UserView.vue'), // Placeholder, actual component will be in UserView
          props: true,
        },
      ],
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
          path: '',
          redirect: (to) => {
            return { path: `/search/songs/${to.params.key}` };
          },
        },
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
          path: '',
          redirect: (to) => {
            return { path: `/artist/${to.params.key}/song` };
          },
        },
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

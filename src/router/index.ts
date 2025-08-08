import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
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
          name: 'search-videos',
          component: () => import('../components/search/playlists.vue'),
          props: true,
        },
      ],
    },
  ],
});

export default router;

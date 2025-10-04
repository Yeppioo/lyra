<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <main class="user-detail-container">
      <div class="userData">
        <div class="cover">
          <a-avatar :size="240" :src="data?.profile?.avatarUrl" :preview="false"> </a-avatar>
        </div>
        <div class="data">
          <a-typography-title :level="2" class="name">{{
            data?.profile?.nickname
          }}</a-typography-title>
          <a-typography-paragraph class="more-info"
            >{{ data?.level ? 'LV.' + data?.level : '' }}
            {{
              data?.identify?.imageDesc ? ' | ' + data?.identify?.imageDesc : ''
            }}</a-typography-paragraph
          >
          <a-typography-text class="occupation">{{ data?.profile?.signature }}</a-typography-text>
          <div class="num">
            <a-typography-text style="flex-wrap: wrap; display: flex" class="listenSongs">
              <font-awesome-icon :icon="['fas', 'music']" size="lg" style="color: #ff4d4f" />
              {{ data?.listenSongs }} 首
            </a-typography-text>
            <a-typography-text style="flex-wrap: wrap; display: flex" class="playlistCount">
              <font-awesome-icon :icon="['fas', 'compact-disc']" size="lg" style="color: #faad14" />
              {{ data?.profile?.playlistCount }} 个歌单
            </a-typography-text>
            <a-typography-text style="flex-wrap: wrap; display: flex" class="follows">
              <font-awesome-icon :icon="['fas', 'users']" size="lg" style="color: #1890ff" />
              {{ data?.profile?.follows }} 关注
            </a-typography-text>
            <a-typography-text style="flex-wrap: wrap; display: flex" class="followeds">
              <font-awesome-icon :icon="['fas', 'user-group']" size="lg" style="color: #1890ff" />
              {{ data?.profile?.followeds }} 粉丝
            </a-typography-text>
          </div>
          <a-typography-paragraph class="desc text-hidden">{{
            data?.profile?.detailDescription || data?.profile?.description
          }}</a-typography-paragraph>
          <a-button
            style="width: 97px"
            v-if="data?.profile?.artistId"
            type="primary"
            @click="jumpToArtistPage">
            <font-awesome-icon
              :icon="['fas', 'user']"
              size="1x"
              style="margin-right: 5px; color: #fff" />
            <span style="color: #fff">歌手页</span>
          </a-button>
        </div>
      </div>
    </main>
    <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" @select="handleMenuSelect">
      <a-menu-item key="created-playlists">创建的歌单</a-menu-item>
      <a-menu-item key="subscribed-playlists">收藏的歌单</a-menu-item>
      <a-menu-item key="notes">笔记</a-menu-item>
      <a-menu-item key="podcasts">播客</a-menu-item>
    </a-menu>
  </div>

  <div class="view">
    <PlaylistGrid
      v-if="selectedKeys[0] === 'created-playlists' && createdPlaylists"
      :playlists="createdPlaylists"
      :totalCount="createdPlaylists.length"
      :loading="loadingPlaylists"
      @pageChange="handleCreatedPlaylistsPageChange" />
    <PlaylistGrid
      v-else-if="selectedKeys[0] === 'subscribed-playlists' && subscribedPlaylists"
      :playlists="subscribedPlaylists"
      :totalCount="subscribedPlaylists.length"
      :loading="loadingPlaylists"
      @pageChange="handleSubscribedPlaylistsPageChange" />
    <div v-else-if="selectedKeys[0] === 'notes'">
      <!-- 笔记内容 -->
      <a-empty description="暂无笔记" />
    </div>
    <div v-else-if="selectedKeys[0] === 'podcasts'">
      <!-- 播客内容 -->
      <a-empty description="暂无播客" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { user } from '../api/netease';
import type { UserDetailResponse, Playlist } from '@/types/user';
import {
  Avatar as AAvatar,
  TypographyTitle as ATypographyTitle,
  TypographyText as ATypographyText,
  TypographyParagraph as ATypographyParagraph,
  Button as AButton,
  Empty as AEmpty,
} from 'ant-design-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import router from '@/router';
import PlaylistGrid from '@/components/common/PlaylistGrid.vue';

const route = useRoute();
const data: Ref<UserDetailResponse | null> = ref(null);
const userId = ref(-1);
const allUserPlaylists: Ref<Playlist[] | null> = ref(null);
const loadingPlaylists = ref(true);

const createdPlaylists = computed(() => {
  return allUserPlaylists.value?.filter((p) => p.creator.userId === userId.value) || [];
});

const subscribedPlaylists = computed(() => {
  return allUserPlaylists.value?.filter((p) => p.creator.userId !== userId.value) || [];
});

onMounted(() => {
  const id = route.params.key as string;
  updateSelectedKeys();
  if (id) {
    userId.value = parseInt(id);
    fetchUserData(userId.value);
    fetchUserPlaylists(userId.value);
  }
});

const selectedKeys = ref<string[]>(['created-playlists']);

const updateSelectedKeys = () => {
  const pathSegments = route.path.split('/');
  const lastSegment = pathSegments[pathSegments.length - 1];
  if (['created-playlists', 'subscribed-playlists', 'notes', 'podcasts'].includes(lastSegment)) {
    selectedKeys.value = [lastSegment];
  } else {
    selectedKeys.value = ['created-playlists']; // 默认选中创建的歌单
  }
};

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(`/user/${route.params.key}/${key}`);
};

const jumpToArtistPage = () => {
  if (data.value?.profile?.artistId) {
    router.push(`/artist/${data.value.profile.artistId}`);
  }
};

watch(
  () => route.path,
  () => {
    updateSelectedKeys();
  },
  { immediate: true }
);
watch(
  () => route.params.key,
  (newId) => {
    updateSelectedKeys();
    const id = newId as string;
    if (id) {
      userId.value = parseInt(id);
      fetchUserData(userId.value);
      fetchUserPlaylists(userId.value);
    }
  }
);

const fetchUserData = async (id: number) => {
  try {
    const userDataRes = await user.getUserDetail(id);
    data.value = userDataRes.data;
  } catch (error) {
    console.error('Error fetching user data:', error);
  }
};

const fetchUserPlaylists = async (id: number, offset: number = 0) => {
  loadingPlaylists.value = true;
  try {
    const limit = 30; // Default limit for user playlists
    const playlistsRes = await user.getUserPlaylist(id, limit, offset);
    allUserPlaylists.value = playlistsRes.data.playlist;
  } catch (error) {
    console.error('Error fetching user playlists:', error);
  } finally {
    loadingPlaylists.value = false;
  }
};

const handleCreatedPlaylistsPageChange = (page: number) => {
  const limit = 30;
  const offset = (page - 1) * limit;
  fetchUserPlaylists(userId.value, offset);
};

const handleSubscribedPlaylistsPageChange = (page: number) => {
  const limit = 30;
  const offset = (page - 1) * limit;
  fetchUserPlaylists(userId.value, offset);
};
</script>

<style scoped>
.user-detail-container {
  padding: 40px;
  display: flex;
  justify-content: center;
}
* {
  color: var(--y-text);
  font-family: var(--y-font);
}
h2 {
  color: var(--y-text) !important;
}
.userData {
  display: flex;
  align-items: center;
  gap: 40px;
  max-width: 1000px;
  width: 100%;
}

.cover {
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.cover .ant-image {
  display: block;
}

.data {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex-grow: 1;
}

.name {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 0;
}

.occupation {
  font-size: 16px;
}

.num {
  display: flex;
  gap: 25px;
  margin-top: 5px;
}
:deep(.ant-menu) {
  background: transparent;
  user-select: none;
}
.more-info {
  margin: 0;
}
.num .ant-typography-text {
  display: flex;
  align-items: center;
  font-size: 15px;
}

.num .svg-inline--fa {
  /* Targeting Font Awesome icons */
  margin-right: 8px;
}

.desc {
  margin-top: 10px;
  line-height: 1.8;
  max-height: 100px; /* Adjusted for better fit */
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  font-size: 14px;
}
.view {
  margin-top: 15px;
}

@media (max-width: 784px) {
  .userData {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .num {
    justify-content: center;
  }
  .data {
    align-items: center;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <main class="artist-detail-container">
      <div class="artistData">
        <div class="cover">
          <a-avatar :size="240" :src="data?.artist?.cover" :preview="false"> </a-avatar>
        </div>
        <div class="data">
          <a-typography-title :level="2" class="name">{{ data?.artist?.name }}</a-typography-title>
          <a-typography-text class="occupation">{{ data?.identify?.imageDesc }}</a-typography-text>
          <div class="num">
            <a-typography-text class="musicSize">
              <font-awesome-icon :icon="['fas', 'music']" size="lg" style="color: #ff4d4f" />
              {{ data?.artist?.musicSize }} 首
            </a-typography-text>
            <a-typography-text class="albumSize">
              <font-awesome-icon :icon="['fas', 'compact-disc']" size="lg" style="color: #faad14" />
              {{ data?.artist?.albumSize }} 张专辑
            </a-typography-text>
            <a-typography-text class="mvSize">
              <font-awesome-icon :icon="['fas', 'video']" size="lg" style="color: #1890ff" />
              {{ data?.artist?.mvSize }} 个 MV
            </a-typography-text>
          </div>
          <a-typography-paragraph class="desc text-hidden">{{
            data?.artist?.briefDesc
          }}</a-typography-paragraph>
        </div>
      </div>
    </main>
    <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" @select="handleMenuSelect">
      <a-menu-item key="song">热门歌曲</a-menu-item>
      <a-menu-item key="all-song">所有歌曲</a-menu-item>
      <a-menu-item key="album">专辑</a-menu-item>
      <a-menu-item key="mv">MV</a-menu-item>
    </a-menu>
  </div>

  <div class="view">
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { artist } from '../api/netease';
import type { ArtistDetailResponse } from '@/types/artist';
import {
  Avatar as AAvatar,
  TypographyTitle as ATypographyTitle,
  TypographyText as ATypographyText,
  TypographyParagraph as ATypographyParagraph,
} from 'ant-design-vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {} from '@fortawesome/free-solid-svg-icons';
import router from '@/router';

const route = useRoute();
const data: Ref<ArtistDetailResponse['data'] | null> = ref(null);
const artistId = ref(-1);
onMounted(() => {
  const id = route.params.key as string;
  updateSelectedKeys();
  if (id) {
    artistId.value = parseInt(id);
    fetchArtistData(artistId.value);
  }
});

const selectedKeys = ref<string[]>(['song']);

const updateSelectedKeys = () => {
  const type = route.name as string;
  if (type) {
    selectedKeys.value = [type];
  } else {
    selectedKeys.value = ['songs']; // 默认选中歌曲
  }
};

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(`/artist/${route.params.key}/${key}`);
};

watch(
  () => route.params.key,
  (newId) => {
    updateSelectedKeys();
    if (newId) {
      artistId.value = parseInt(newId as string);
      fetchArtistData(artistId.value);
    }
  }
);

const fetchArtistData = async (id: number) => {
  try {
    const artistData = await artist.getArtistDetail(id);
    data.value = artistData.data.data;
  } catch (error) {
    console.error('Error fetching artist data:', error);
  }
};
</script>

<style scoped>
.artist-detail-container {
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
.artistData {
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
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="album-search-result">
    <div class="album-list">
      <div class="album-item" v-for="item in albumList" :key="item.id">
        <a-skeleton-image v-if="loading" active />
        <div v-else class="album-cover-wrapper">
          <a-image
            :fallback="fallbackImg"
            :placeholder="true"
            class="album-cover"
            :size="150"
            :preview="false"
            :src="item.picUrl" />
          <div class="play-icon-overlay">
            <font-awesome-icon :icon="['fas', 'play-circle']" size="3x" class="play-icon" />
          </div>
          <div class="publish-time-overlay">
            {{ formatTimestampToDate(item.publishTime) }}
          </div>
        </div>

        <div class="album-info">
          <div class="album-name">{{ item.name }}</div>
          <div class="ar-name-container">
            <template v-for="a in item.artist" :key="a.id">
              <a @click="jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 10px">
      <a-pagination
        @change="pageChange"
        :defaultPageSize="15"
        v-model:current="currentPage"
        :total="albumCount"
        show-less-items />
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { fallbackImg } from '@/stores/constant';
import { artist } from '@/api/netease';
import { formatTimestampToDate } from '@/utils/time';
import router from '@/router';

const route = useRoute();
const albumList = ref<any[]>([]);
const currentPage = ref(1);
const loading = ref(true);
const cachedPages = new Map<number, any[]>();
const albumCount = ref(0);
const jumpArtist = (id: number) => {
  router.push(`/artist/${id}/song`);
};
const fetchAlbums = async (page: number, artistId: string) => {
  if (cachedPages.has(page)) {
    albumList.value = cachedPages.get(page) || [];
    currentPage.value = page;
    return;
  }
  loading.value = true;
  // albumList.value = [...new Array(15)].map(() => ({ loading: true }));

  try {
    const limit = 15;
    const offset = (page - 1) * limit;
    const [albumsResult, artistDetailResult] = await Promise.all([
      artist.getArtistAlbum(parseInt(artistId), limit, offset),
      artist.getArtistDetail(parseInt(artistId)),
    ]);

    const albums = albumsResult.data.hotAlbums.map(
      (album: { id: any; name: any; artists: any[]; picUrl: any; publishTime: any }) => ({
        id: album.id,
        name: album.name,
        artist: album.artists.map((a: { name: any; id: any }) => ({
          name: a.name,
          id: a.id,
        })),
        picUrl: album.picUrl,
        publishTime: album.publishTime,
      })
    );

    console.log(albums);

    albumCount.value = artistDetailResult.data.data.artist.albumSize as number;
    cachedPages.set(page, albums);
    albumList.value = albums;
  } catch (error) {
    message.error('获取专辑失败');
    console.error('获取专辑失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const artistId = route.params.key as string;
  if (artistId) {
    fetchAlbums(currentPage.value, artistId);
  }
});

const pageChange = () => {
  fetchAlbums(currentPage.value, route.params.key as string);
};

watch(
  () => route.params.key,
  (newKey) => {
    if (newKey) {
      cachedPages.clear();
      fetchAlbums(1, newKey as string);
    }
  }
);
</script>

<style scoped>
.album-search-result {
  padding-bottom: 40px;
}

.album-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  justify-items: center;
}

.album-item {
  position: relative;
  width: 150px;
  text-align: center;
  cursor: pointer;
}
.ar-name {
  color: var(--y-text);
  font-family: var(--y-font);
  line-height: 1.3;
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}
.ar-name {
  margin-top: 2px;
  font-size: 12px;
  color: #909092 !important;
  padding: 0;
  min-width: 35px;
  font-family: var(--y-font);
  cursor: pointer;
  text-align: left;
}
.ar-name ~ .ar-name::before {
  content: ',';
  margin: 0 4px 0 3px;
  color: #909092 !important;
}
.ar-name::before {
  position: static !important;
}
.ar-name:hover {
  color: #1677ff !important;
}
.ar-name-container {
  display: flex;
  flex-direction: row;
  white-space: wrap;
  overflow: hidden;
  max-width: 140px;
  overflow: hidden;
}
.album-cover-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

.album-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.album-item:hover .album-cover {
  transform: scale(1.05);
}

.album-cover-wrapper :deep(img) {
  border-radius: 10px;
}
.album-cover-wrapper:hover :deep(img) {
    transform: scale(1.1);
}

.play-icon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3); /* 调整背景颜色，使其更模糊 */
  backdrop-filter: blur(5px); /* 添加模糊效果 */
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-item:hover .play-icon-overlay {
  opacity: 1;
}

.play-icon {
  color: white; /* 播放图标为白色 */
}

.album-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 4px;
  margin-right: 4px;
  margin-top: 6px;
}

.album-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 140px;
  text-overflow: ellipsis;
}

.artist-name {
  font-size: 13px;
  padding: 0;
  color: var(--y-text-light);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.artist-name:hover {
  color: #1677ff !important;
}

.publish-time {
  font-size: 12px;
  color: var(--y-text-light);
}

.publish-time-overlay {
  position: absolute;
  bottom: 0px;
  right: 0px;
  background-color: rgba(0, 0, 0, 0.45);
  color: white;
  padding: 2px 5px;
  border-radius: 8px 0 10px 0;
  font-size: 12px;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.album-item:hover .publish-time-overlay {
  opacity: 0;
}

.album-search-result :deep(.ant-pagination-options) {
  display: none;
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="mv-search-result">
    <div class="mv-list">
      <div class="mv-item" v-for="item in mvList" :key="item.id">
        <a-skeleton-image v-if="loading" active />
        <div @click.stop="jumper.jumpVideo(item.id)" v-else class="mv-cover-wrapper">
          <a-image
            :fallback="fallbackImg"
            :placeholder="true"
            class="mv-cover"
            :preview="false"
            :src="item.imgurl16v9" />
          <div class="play-icon-overlay">
            <font-awesome-icon :icon="['fas', 'play-circle']" size="3x" class="play-icon" />
          </div>
          <div class="play-count-overlay">
            <font-awesome-icon class="play-icon" :icon="['fas', 'play']" />
            {{ formatNumber(item.playCount) }}
          </div>
          <div class="duration-overlay">
            {{ formatMsToMinutes(item.duration) }}
          </div>
        </div>

        <div class="mv-info">
          <div class="mv-name">{{ item.name }}</div>
          <div class="ar-name-container">
            <a @click.stop="jumper.jumpArtist(item.artist.id)" class="ar-name">{{
              item.artist.name
            }}</a>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 10px">
      <a-pagination
        @change="pageChange"
        :defaultPageSize="15"
        v-model:current="currentPage"
        :total="mvCount"
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
import { formatNumber, formatMsToMinutes } from '@/utils/time';
import * as jumper from '@/utils/jumper';

const route = useRoute();
const mvList = ref<any[]>([]);
const currentPage = ref(1);
const loading = ref(true);
const cachedPages = new Map<number, any[]>();
const mvCount = ref(0);
const fetchMVs = async (page: number, artistId: string) => {
  if (cachedPages.has(page)) {
    mvList.value = cachedPages.get(page) || [];
    currentPage.value = page;
    return;
  }
  loading.value = true;
  // mvList.value = [...new Array(15)].map(() => ({ loading: true }));

  try {
    const limit = 15;
    const offset = (page - 1) * limit;
    const mvsResult = await artist.getArtistMv(parseInt(artistId), limit, offset);

    const mvs = mvsResult.data.mvs.map(
      (mv: {
        id: any;
        name: any;
        artistName: any;
        artist: { id: any; name: any };
        imgurl16v9: any;
        duration: any;
        playCount: any;
      }) => ({
        id: mv.id,
        name: mv.name,
        artist: {
          id: mv.artist.id,
          name: mv.artist.name,
        },
        imgurl16v9: mv.imgurl16v9,
        duration: mv.duration,
        playCount: mv.playCount,
      })
    );

    // console.log(mvs);

    mvCount.value = mvsResult.data.count as number; // 假设MV接口返回的数据中包含总数
    cachedPages.set(page, mvs);
    mvList.value = mvs;
  } catch (error) {
    message.error('获取MV失败');
    console.error('获取MV失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const artistId = route.params.key as string;
  if (artistId) {
    fetchMVs(currentPage.value, artistId);
  }
});

const pageChange = () => {
  fetchMVs(currentPage.value, route.params.key as string);
};

watch(
  () => route.params.key,
  (newKey) => {
    if (newKey) {
      cachedPages.clear();
      fetchMVs(1, newKey as string);
    }
  }
);
</script>

<style scoped>
.mv-search-result {
  padding-bottom: 40px;
}

.mv-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); /* 调整宽度以适应16:9 */
  gap: 20px;
  justify-items: center;
}

.mv-item {
  position: relative;
  width: 200px; /* 调整宽度 */
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
  display: inline;
}
.ar-name:hover {
  color: #1677ff !important;
}
.ar-name-container {
  display: flex;
  flex-direction: row;
  white-space: wrap;
  overflow: hidden;
  max-width: 190px; /* 调整最大宽度 */
  overflow: hidden;
}
.mv-cover-wrapper {
  position: relative;
  width: 200px; /* 调整宽度 */
  height: 112.5px; /* 16:9 比例 */
  border-radius: 10px;
  overflow: hidden;
}

.mv-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.mv-item:hover .mv-cover {
  transform: scale(1.05);
}

.mv-cover-wrapper :deep(img) {
  border-radius: 10px;
}
.mv-cover-wrapper:hover :deep(img) {
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

.mv-cover-wrapper:hover .play-icon-overlay {
  opacity: 1;
}
* {
  user-select: none;
}
.play-icon {
  color: white; /* 播放图标为白色 */
}

.mv-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 4px;
  margin-right: 4px;
  margin-top: 6px;
}

.mv-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 190px; /* 调整最大宽度 */
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

.play-count-overlay {
  position: absolute;
  top: 0px;
  right: 0px;
  background-color: rgba(0, 0, 0, 0.45);
  color: white;
  padding: 2px 5px;
  border-radius: 0 10px 0 8px;
  font-size: 12px;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.duration-overlay {
  position: absolute;
  bottom: 0px;
  left: 0px;
  background-color: rgba(0, 0, 0, 0.45);
  color: white;
  padding: 2px 5px;
  border-radius: 0 8px 0 10px;
  font-size: 12px;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.mv-cover-wrapper:hover .play-count-overlay,
.mv-cover-wrapper:hover .duration-overlay {
  opacity: 0;
}

.mv-search-result :deep(.ant-pagination-options) {
  display: none;
}
</style>

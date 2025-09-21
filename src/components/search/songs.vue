<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <a-menu :disabled="loading" v-model:selectedKeys="current" mode="vertical">
      <a-menu-item
        @click="handleMenuItemClick(item.id, item.picUrl)"
        :disabled="loading"
        v-for="item in songsList"
        :key="item.id">
        <a-skeleton avatar :title="false" v-if="loading" active>
          <a-list-item-meta>
            <template #avatar>
              <a-avatar />
            </template>
          </a-list-item-meta>
        </a-skeleton>
        <div class="item" v-else>
          <a-image
            :preview="false"
            :fallback="fallbackImg"
            :placeholder="true"
            class="icon-img"
            :width="48"
            :height="48"
            :src="item.picUrl">
          </a-image>
          <div class="info">
            <div class="basic-info">
              <div class="song-name-container">
                <span class="song-name">
                  {{ item.name }}
                </span>
                <div v-if="item.requireVip" class="vip-tag tag">
                  <span>VIP</span>
                </div>
                <div v-if="item.hasMv" class="mv-tag tag">
                  <span>MV</span>
                </div>
              </div>
              <div class="ar-name-container">
                <template v-for="a in item.artists" :key="a.id">
                  <a @click="jumper.jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
                </template>
              </div>
            </div>
            <span class="album">{{ item.album.name }}</span>
            <span class="duration">{{ formatSecondsToMinutes(item.duration / 1000) }}</span>
            <font-awesome-icon class="more-button" size="xl" :icon="['fas', 'ellipsis']" />
          </div>
        </div>
      </a-menu-item>
    </a-menu>
    <div style="display: flex; justify-content: center; margin-top: 10px">
      <a-pagination
        @change="pageChange"
        v-model:current="currentPage"
        :total="songCount"
        show-less-items />
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { usePlayerStore, setCurrentSong } from '@/stores/player';

import { onMounted, ref, watch } from 'vue';
import {
  functions as neteaseApi,
  type SongEntry,
  type SearchResult,
} from '@/api/netease/searchSongs';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { fallbackImg } from '@/stores/constant';
import * as jumper from '@/utils/jumper';

const route = useRoute();
const songsList = ref<any[]>([]);
const currentPage = ref(1);
const loading = ref(true);
const cachedPages = new Map<number, SongEntry[]>();
const songCount = ref(0);
const current = ref<SongEntry[] | null>(null);

const fetchSongs = async (page: number, key: string) => {
  if (cachedPages.has(page)) {
    songsList.value = cachedPages.get(page) || [];
    currentPage.value = page;
    return;
  }
  loading.value = true;
  songsList.value = [...new Array(3)].map(() => ({ loading: true, name: {}, picture: {} }));
  const result: SearchResult = await neteaseApi.searchSongs(key, page);

  cachedPages.set(page, result.songs);
  if (result.count > 0 && songCount.value === 0) {
    songCount.value = result.count;
  }
  songsList.value = result.songs;
  loading.value = false;
};

const formatSecondsToMinutes = (seconds: number) => {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

onMounted(() => {
  const key = route.params.key as string;
  if (key) {
    fetchSongs(currentPage.value, key);
  }
});

const pageChange = () => {
  fetchSongs(currentPage.value, route.params.key as string);
};

const playerStore = usePlayerStore();
const handleMenuItemClick = async (key: number, cover: string) => {
  const songId = key;
  const song = songsList.value.find((s: any) => s.id == songId);
  if (!song) return;
  try {
    const artists = [];
    for (const a of song.artists) {
      artists.push({
        id: a.id,
        name: a.name,
      });
    }
    setCurrentSong(
      {
        id: songId,
        duration: song.duration,
        name: song.name,
        artist: artists,
        cover: cover,
      },
      playerStore
    );
  } catch {
    message.error('播放失败');
  }
};

watch(
  () => route.params.key,
  (newKey) => {
    if (newKey) {
      cachedPages.clear();
      fetchSongs(1, newKey as string);
    }
  }
);
</script>

<style scoped>
.tag span {
  line-height: 1;
  font-size: 10px;
}
.tag {
  padding: 0 7.3px;
  border-radius: 91px;
  height: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  margin-top: 4px;
}
.ar-name-container {
  display: flex;
  max-width: 300px;
  flex-direction: row;
  flex-wrap: wrap;
}
.song-name-container {
  line-height: 1.5 !important;
  display: flex;
}
.more-button {
  position: absolute;
  right: 22px;
  display: none;
}
.ar-name ~ .ar-name::before {
  content: ',';
  margin: 0 5px;
  color: var(--y-text) !important;
}
.ar-name::before {
  position: static !important;
}
.duration {
  position: absolute;
  right: 24px;
}
.album {
  position: absolute;
  left: 400px;
}
.info {
  display: flex;
  margin-left: 16px;
  align-items: center;
}
.songs-search-result {
  overflow: clip;
  padding-bottom: 40px;
}
.basic-info {
  display: flex;
  flex-direction: column;
  position: relative;
  top: -2px;
  margin-right: 40px;
}
.basic-info span {
  font-family: var(--y-font);
  text-overflow: ellipsis;
  line-height: 1;
  overflow: clip;
  max-width: 280px;
}
.ar-name {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  word-wrap: break-word;
  text-wrap: auto;
  line-height: 1.1 !important;
  max-width: 300px;
  padding: 0;
}
.ar-name:hover {
  color: #1677ff !important;
}
.album {
  line-height: 1.3 !important;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  word-wrap: break-word;
  text-wrap: auto;
  margin-right: 75px;
  text-overflow: ellipsis;
  overflow: clip;
}
.song-name {
  font-size: 16px;
  line-height: 1.5 !important;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
  line-clamp: 5;
  word-wrap: break-word;
  text-wrap: auto;
}

.item {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.songs-search-result :deep(.ant-pagination-options) {
  display: none;
}
.songs-search-result :deep(.icon-img) {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}
.songs-search-result :deep(.ant-pagination-item-link) {
  height: 32px;
  display: block;
  position: relative;
  top: -3px;
}
.songs-search-result :deep(.ant-menu-item) {
  background: var(--y-com-bg) !important;
  margin-bottom: 15px;
  padding: 16px;
  display: inline-table !important;
  align-items: center !important;
  border: rgb(239, 239, 245) 1px solid;
}
[theme-dark] .songs-search-result :deep(.ant-menu-item) {
  border: rgba(255, 255, 255, 0.09) 1px solid;
}
.songs-search-result :deep(.ant-menu) {
  border: 0;
}
.songs-search-result :deep(.ant-menu-item-selected) {
  border: #70baff 1px solid !important;
  background: #70baff1f !important;
  span {
    color: #70baff;
  }
}

.songs-search-result :deep(.ant-menu-item-active) {
  border: #70baff 1px solid !important;
}
.vip-tag {
  background: #f55e551f;
}
.vip-tag span {
  color: #f55e55 !important;
}
.mv-tag {
  background: rgba(242, 201, 125, 0.16);
}
.mv-tag span {
  color: #ffa600 !important;
}
[theme-dark] .mv-tag {
  background: rgba(240, 160, 32, 0.15);
}
[theme-dark] .mv-tag span {
  color: #f0a020 !important;
}
@media (max-width: 734px) {
  .album,
  .duration {
    display: none;
  }
  .more-button {
    display: unset;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <a-menu
      :disabled="loading"
      v-model:selectedKeys="current"
      mode="vertical"
      @click="handleMenuItemClick">
      <a-menu-item :disabled="loading" v-for="item in songsList" :key="item.id">
        <a-skeleton avatar :title="false" v-if="loading" active>
          <a-list-item-meta>
            <template #avatar>
              <a-avatar />
            </template>
          </a-list-item-meta>
        </a-skeleton>
        <div class="item" v-else>
          <a-image class="icon-img" :width="48" :height="48" :src="item.picUrl">
            <template #fallback>
              <div class="state-container">
                <span>加载失败</span>
              </div>
            </template>
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
              <span class="ar-name">{{
                item.artists.map((a: { name: any }) => a.name).join(', ')
              }}</span>
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
import { usePlayerStore } from '@/stores/player';
import { functions as getSongApi } from '@/api/netease/getSong';

import { onMounted, ref, watch } from 'vue';
import {
  functions as neteaseApi,
  type SongEntry,
  type SearchResult,
} from '@/api/netease/searchSongs';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';

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
  console.log(result);

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
const handleMenuItemClick = async (e: { key: string }) => {
  const songId = e.key;
  const song = songsList.value.find((s: any) => s.id == songId);
  if (!song) return;
  // 获取播放url
  try {
    const urlRes = await getSongApi.getSongUrl(songId);
    const url = urlRes.data?.[0]?.url;
    if (!url) {
      message.error('无法获取播放地址');
      return;
    }
    // 构造播放信息
    const info = {
      name: song.name,
      artist: song.artists?.map((a: any) => a.name).join(', '),
      url,
      cover: song.picUrl || song.album?.picUrl,
      id: song.id,
    };
    // 设置pinia store
    playerStore.setPlayList(
      songsList.value.map((s: any) => ({
        name: s.name,
        artist: s.artists?.map((a: any) => a.name).join(', '),
        url: '', // 只在当前播放项填真实url
        cover: s.picUrl || s.album?.picUrl,
        id: s.id,
      })),
      songsList.value.findIndex((s: any) => s.id == songId)
    );
    playerStore.play(
      info,
      songsList.value.findIndex((s: any) => s.id == songId)
    );
    // 直接调用全局播放器
    (window as any).MusicPlayer?.play(
      url,
      { name: info.name, artist: info.artist },
      { cover: info.cover }
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

.song-name-container {
  line-height: 1.5 !important;
  display: flex;
}
.more-button {
  position: absolute;
  right: 22px;
  display: none;
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
  height: 80px;
  background: var(--y-com-bg) !important;
  margin-bottom: 15px;
  padding: 16px;
  border: rgb(239, 239, 245) 1px solid;
}
[theme-dark] .songs-search-result :deep(.ant-menu-item) {
  border: rgba(255, 255, 255, 0.09) 1px solid;
  display: inline-table;
}
.songs-search-result :deep(.ant-menu) {
  border: 0;
}
.songs-search-result :deep(.ant-menu-item-selected) {
  border: #f55e55 1px solid !important;
  background: #f55e551f !important;
  span {
    color: #f55e55;
  }
}

.songs-search-result :deep(.ant-menu-item-active) {
  border: #f55e55 1px solid !important;
}
.vip-tag {
  background: #f55e551f;
}
.vip-tag span {
  color: #f55e55;
}
.mv-tag {
  background: rgba(242, 201, 125, 0.16);
}
.mv-tag span {
  color: #f2c97d !important;
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

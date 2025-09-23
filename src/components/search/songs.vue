<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <SongList
      :songs="songsList"
      :loading="loading"
      :showPagination="true"
      :totalSongs="songCount"
      :currentPage="currentPage"
      @pageChange="pageChange"
      @update:currentPage="currentPage = $event" />
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { functions as neteaseApi, type SearchResult } from '@/api/netease/searchSongs';
import { useRoute } from 'vue-router';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';

const route = useRoute();
const songsList = ref<SongListItem[]>([]);
const currentPage = ref(1);
const loading = ref(true);
const cachedPages = new Map<number, SongListItem[]>();
const songCount = ref(0);

const fetchSongs = async (page: number, key: string) => {
  if (cachedPages.has(page)) {
    songsList.value = cachedPages.get(page) || [];
    currentPage.value = page;
    return;
  }
  loading.value = true;
  songsList.value = []; // Clear songsList for loading state
  const result: SearchResult = await neteaseApi.searchSongs(key, page);

  const mappedSongs: SongListItem[] = result.songs.map((s) => ({
    id: s.id,
    name: s.name,
    artists: s.artists.map((a) => ({ id: a.id, name: a.name })),
    album: {
      id: s.album.id,
      name: s.album.name,
      picUrl: s.picUrl, // Corrected to use s.picUrl
    },
    duration: s.duration,
    hasMv: s.hasMv,
    mvId: s.mvId,
    requireVip: s.requireVip,
    picUrl: s.picUrl,
  }));

  cachedPages.set(page, mappedSongs);
  if (result.count > 0 && songCount.value === 0) {
    songCount.value = result.count;
  }
  songsList.value = mappedSongs;
  loading.value = false;
};

onMounted(() => {
  const key = route.params.key as string;
  if (key) {
    fetchSongs(currentPage.value, key);
  }
});

const pageChange = (page: number) => {
  fetchSongs(page, route.params.key as string);
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
.songs-search-result {
  overflow: clip;
  padding-bottom: 40px;
}
</style>

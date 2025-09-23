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

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { artist } from '@/api/netease';
import { functions as getSongApi } from '@/api/netease/getSong';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';

interface ArtistResponse {
  id: number;
  name: string;
}

interface AlbumResponse {
  id: number;
  name: string;
  picUrl: string;
}

interface SongResponse {
  id: number;
  name: string;
  ar: ArtistResponse[];
  dt: number;
  al: AlbumResponse;
  mv: number;
  fee: number;
}

interface ArtistAllSongsResponse {
  songs: SongResponse[];
  total: number;
}

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
  const result: { data: ArtistAllSongsResponse } = await artist.getArtistAllSongs(
    key,
    'hot',
    15,
    (page - 1) * 15
  );

  const songList: SongListItem[] = result.data.songs.map(
    (s: SongResponse) =>
      ({
        id: s.id,
        name: s.name,
        artists: s.ar.map((a: ArtistResponse) => ({ id: a.id, name: a.name })),
        duration: s.dt,
        album: {
          id: s.al.id,
          name: s.al.name,
          picUrl: s.al.picUrl,
        },
        hasMv: s.mv !== 0,
        mvId: s.mv,
        requireVip: s.fee === 1,
        picUrl: s.al.picUrl,
      }) as SongListItem
  );

  const pics = await getSongApi.getSongPics(songList.map((s) => s.id.toString())); // Convert id to string
  for (let i = 0; i < songList.length; i++) {
    songList[i].picUrl = pics[i];
  }

  songCount.value = result.data.total;
  cachedPages.set(page, songList);
  songsList.value = songList;
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

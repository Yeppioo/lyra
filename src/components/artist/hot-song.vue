<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <SongList :songs="songsList" :loading="loading" />
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { artist } from '../../api/netease';
import { useRoute } from 'vue-router';
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

interface ArtistTopSongsResponse {
  songs: SongResponse[];
}

const route = useRoute();
const songsList = ref<SongListItem[]>([]);
const loading = ref(true);

const fetchSongs = async (key: string) => {
  loading.value = true;
  songsList.value = []; // Clear songsList for loading state

  const result: { data: ArtistTopSongsResponse } = await artist.getArtistTopSongs(key);
  songsList.value = result.data.songs.map((s: SongResponse) => ({
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
  }) as SongListItem);
  loading.value = false;
};

onMounted(() => {
  const key = route.params.key as string;
  if (key) {
    fetchSongs(key);
  }
});

watch(
  () => route.params.key,
  (newKey) => {
    if (newKey) {
      fetchSongs(newKey as string);
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
  display: inline;
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
.basic-info a {
  font-family: var(--y-font);
  text-overflow: ellipsis;
  line-height: 1;
  overflow: clip;
  max-width: 280px;
}
@media (max-width: 734px) {
  .basic-info a {
    max-width: 528px;
  }
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
.ar-name:hover,
.album:hover,
.song-name:hover {
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
  border: rgb(239, 239, 245) 1px solid;
  display: inline-table !important;
  align-items: center !important;
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
.mv-tag:hover {
  background: #98c3ff !important;
}
.mv-tag:hover span {
  color: #1677ff !important;
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

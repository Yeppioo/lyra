<template>
  <div class="container">
    <SongList :songs="displayedSong" :loading="loading" :loadingCount="1"/>
    <div class="title">
      <span style="font-size: 22px;">全部评论</span>
      <sup style="font-size: 16px;margin-left: 2px;">{{ commentCount }}</sup>
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { getSong } from '@/api/netease';
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';

const route = useRoute();
const currentId = ref('');
const displayedSong = ref<SongListItem[]>([]);
const loading = ref(false);
const commentCount = ref('');

onMounted(() => {
  currentId.value = route.params.key as string;
  fetchInfo();
});

watch(
  () => route.params.key,
  async (newId) => {
    if (newId) {
      currentId.value = newId as string;
      fetchInfo();
    }
  }
);

const fetchInfo = async () => {
  // 获取歌曲列表信息
  (async () => {
    displayedSong.value = [];
    loading.value = true;
    const songDetailResponse = await getSong.getSongDetail(currentId.value);
    if (songDetailResponse.songs && songDetailResponse.songs.length > 0) {
      displayedSong.value = songDetailResponse.songs.map((song) => ({
        id: song.id,
        name: song.name,
        artists: song.ar.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: song.al.id,
          name: song.al.name,
          picUrl: song.al.picUrl,
        },
        duration: song.dt,
        hasMv: song.mv !== 0,
        mvId: song.mv,
        requireVip: song.fee === 1,
        picUrl: song.al.picUrl,
      }));
    }
    loading.value = false;
  })();
};
</script>

<style scoped>
span,sup{
  color: var(--y-text);
  font-family: var(--y-font);
}

</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main></main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import { artist } from '../api/netease';
import type { ArtistDetailResponse } from '@/types/artist';

const route = useRoute();
const data: Ref<ArtistDetailResponse | null> = ref(null);
const artistId = ref(-1);
onMounted(() => {
  const id = route.params.id as string;
  if (id) {
    artistId.value = parseInt(id);
    fetchArtistData(artistId.value);
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      artistId.value = parseInt(newId as string);
      fetchArtistData(artistId.value);
    }
  }
);

const fetchArtistData = async (id: number) => {
  try {
    const artistData = await artist.getArtistDetail(id);
    data.value = artistData.data;
  } catch (error) {
    console.error('Error fetching artist data:', error);
  }
};
</script>

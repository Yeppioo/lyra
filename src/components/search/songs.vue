<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <h4>歌曲搜索结果："{{ route.params.key }}"</h4>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();

onMounted(() => {
  console.log('route');
});
</script>

<style scoped>
.songs-search-result {
  padding: 20px 0;
}
</style>

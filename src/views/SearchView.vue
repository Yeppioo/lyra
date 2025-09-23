<template>
  <div class="container">
    <div class="title">
      <span class="key">"{{ route.params.key }}"</span>
      <span class="label">的搜索结果</span>
    </div>

    <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" @select="handleMenuSelect">
      <a-menu-item key="songs">歌曲</a-menu-item>
      <a-menu-item key="artists">歌手</a-menu-item>
      <a-menu-item key="albums">专辑</a-menu-item>
      <a-menu-item key="videos">视频</a-menu-item>
      <a-menu-item key="playlist">歌单</a-menu-item>
    </a-menu>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const selectedKeys = ref<string[]>(['songs']);

const updateSelectedKeys = () => {
  const type = route.name as string;
  if (type) {
    selectedKeys.value = [type.replace('search-', '')];
  } else {
    selectedKeys.value = ['songs']; // 默认选中歌曲
  }
};

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(`/search/${key}/${route.params.key}`);
};

watch(
  () => route.path,
  () => {
    updateSelectedKeys();
  },
  { immediate: true }
);

onMounted(() => {
  updateSelectedKeys();
});
</script>

<style scoped>
.title .key {
  font-size: 40px;
  color: var(--y-text);
  margin-right: 20px;
  font-family: var(--y-font);
}
.title .label {
  font-size: 20px;
  color: var(--y-text);
  font-family: var(--y-font);
}
.ant-menu-horizontal {
  margin-bottom: 20px;
}
.container :deep(.ant-menu) {
  background: transparent;
  user-select: none;
}
</style>

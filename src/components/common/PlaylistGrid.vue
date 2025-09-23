<template>
  <div class="playlist-grid-container">
    <div class="playlist-list">
      <div class="playlist-item" v-for="item in playlists" :key="item.id">
        <a-skeleton-image v-if="loading" active />
        <div @click.stop="jumper.jumpPlaylist(item.id)" v-else class="playlist-cover-wrapper">
          <a-image
            :fallback="fallbackImg"
            :placeholder="true"
            class="playlist-cover"
            :size="150"
            :preview="false"
            :src="item.coverImgUrl" />
          <div class="play-icon-overlay">
            <font-awesome-icon :icon="['fas', 'play-circle']" size="3x" class="play-icon" />
          </div>
          <div class="play-count-overlay">
            <font-awesome-icon style="color: #fff" :icon="['fas', 'headphones']" size="sm" />
            {{ formatNumber(item.playCount) }}
          </div>
        </div>

        <div class="playlist-info">
          <div class="playlist-name">{{ item.name }}</div>
          <div class="creator-name-container">
            <a @click.stop="jumper.jumpUser(item.creator.userId)" class="creator-name">{{
              item.creator.nickname
            }}</a>
          </div>
        </div>
      </div>
    </div>
    <div style="display: flex; justify-content: center; margin-top: 10px">
      <a-pagination
        @change="pageChange"
        :defaultPageSize="30"
        v-model:current="currentPage"
        :total="totalCount"
        show-less-items />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { fallbackImg } from '@/stores/constant';
import { formatNumber } from '@/utils/time';
import * as jumper from '@/utils/jumper';
import type { Playlist } from '@/types/user';

const props = defineProps<{
  playlists: Playlist[];
  totalCount: number;
  loading: boolean;
  pageSize?: number;
}>();

const emit = defineEmits(['pageChange']);

const currentPage = ref(1);

watch(
  () => props.playlists,
  (newPlaylists) => {
    if (newPlaylists) {
      // Optionally reset currentPage if playlists change significantly
      // currentPage.value = 1;
    }
  },
  { immediate: true }
);

const pageChange = (page: number) => {
  currentPage.value = page;
  emit('pageChange', page);
};
</script>

<style scoped>
.playlist-grid-container {
  padding-bottom: 40px;
}

.playlist-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 20px;
  justify-items: center;
}

.playlist-item {
  position: relative;
  width: 150px;
  text-align: center;
  cursor: pointer;
}

.creator-name {
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
  margin-top: 2px;
  font-size: 12px;
  color: #909092 !important;
  padding: 0;
  min-width: 35px;
  cursor: pointer;
  text-align: left;
}

.creator-name:hover {
  color: #1677ff !important;
}

.creator-name-container {
  display: flex;
  flex-direction: row;
  white-space: wrap;
  overflow: hidden;
  max-width: 140px;
  overflow: hidden;
}

.playlist-cover-wrapper {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 10px;
  overflow: hidden;
}

.playlist-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.playlist-item:hover .playlist-cover {
  transform: scale(1.05);
}

.playlist-cover-wrapper :deep(img) {
  border-radius: 10px;
}
.playlist-cover-wrapper:hover :deep(img) {
  transform: scale(1.1);
}

.play-icon-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(5px);
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.playlist-cover-wrapper:hover .play-icon-overlay {
  opacity: 1;
}

.play-icon {
  color: white;
}

.playlist-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-left: 4px;
  margin-right: 4px;
  margin-top: 6px;
}

.playlist-name {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  max-width: 140px;
  text-overflow: ellipsis;
}

.play-count-overlay {
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.45);
  color: white;
  padding: 2px 5px;
  border-radius: 8px;
  font-size: 12px;
  opacity: 1;
  transition: opacity 0.3s ease;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 3px;
}

.playlist-grid-container :deep(.ant-pagination-options) {
  display: none;
}
</style>

<template>
  <div class="songs-list-container">
    <a-menu :disabled="loading" v-model:selectedKeys="current" mode="vertical">
      <template v-if="loading">
        <a-menu-item v-for="i in loadingCount ?? 3" :key="`skeleton-${i}`">
          <a-skeleton avatar :title="false" active>
            <a-list-item-meta>
              <template #avatar>
                <a-avatar />
              </template>
            </a-list-item-meta>
          </a-skeleton>
        </a-menu-item>
      </template>
      <template v-else>
        <a-menu-item
          @click="handleMenuItemClick(item.id, item.picUrl)"
          :disabled="loading"
          v-for="(item, index) in songs"
          :key="item.id">
          <div class="item">
            <a-image
              v-if="!showRank"
              :fallback="fallbackImg"
              :placeholder="true"
              class="icon-img"
              :width="48"
              :preview="false"
              :height="48"
              :src="item.picUrl">
            </a-image>
            <div v-else class="rank">
              <span>{{ index + 1 }}</span>
            </div>
            <div class="info">
              <div class="basic-info">
                <div class="song-name-container">
                  <a @click.stop="jumper.jumpSong(item.id)" class="song-name no-before">
                    {{ item.name }}
                  </a>
                  <div v-if="item.requireVip" class="vip-tag tag">
                    <span>VIP</span>
                  </div>
                  <a
                    @click.stop="jumper.jumpVideo(item.mvId)"
                    v-if="item.hasMv"
                    class="mv-tag tag no-before">
                    <span>MV</span>
                  </a>
                </div>
                <div class="ar-name-container">
                  <template v-for="a in item.artists" :key="a.id">
                    <a @click.stop="jumper.jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
                  </template>
                </div>
              </div>
              <a
                v-if="!hideAlbum"
                @click.stop="jumper.jumpAlbum(item.album.id)"
                class="album no-before"
                >{{ item.album.name }}</a
              >
              <span class="duration">{{ formatSecondsToMinutes(item.duration / 1000) }}</span>
              <font-awesome-icon class="more-button" size="xl" :icon="['fas', 'ellipsis']" />
            </div>
          </div>
        </a-menu-item>
      </template>
    </a-menu>
    <div
      v-if="showPagination && totalSongs > pageSize"
      style="display: flex; justify-content: center; margin-top: 10px">
      <a-pagination
        @change="onPageChange"
        :defaultPageSize="pageSize"
        :current="currentPage"
        :total="totalSongs"
        show-less-items />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePlayerStore, setCurrentSong } from '@/stores/player';
import { message } from 'ant-design-vue';
import { fallbackImg } from '@/stores/constant';
import * as jumper from '@/utils/jumper';

interface Artist {
  id: number;
  name: string;
}

interface Album {
  id: number;
  name: string;
  picUrl?: string;
}

export interface SongListItem {
  id: number;
  name: string;
  artists: Artist[];
  album: Album;
  duration: number;
  picUrl: string;
  hasMv: boolean;
  mvId: number;
  requireVip: boolean;
}

// Define Props
interface SongListProps {
  songs: SongListItem[];
  loading?: boolean;
  showPagination?: boolean;
  showRank?: boolean;
  hideAlbum?: boolean;
  totalSongs?: number;
  currentPage?: number;
  pageSize?: number;
  loadingCount?: number;
}

const props = withDefaults(defineProps<SongListProps>(), {
  loading: false,
  showPagination: false,
  totalSongs: 0,
  currentPage: 1,
  pageSize: 15,
});

// Define Emits
const emit = defineEmits(['songClick', 'pageChange', 'update:currentPage']);

const current = ref<string[]>([]); // For a-menu selectedKeys
const playerStore = usePlayerStore();

const formatSecondsToMinutes = (seconds: number) => {
  const totalSeconds = Math.floor(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const handleMenuItemClick = async (songId: number, cover: string) => {
  const song = props.songs.find((s) => s.id == songId);
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
    emit('songClick', songId, cover);
  } catch {
    message.error('播放失败');
  }
};

const onPageChange = (page: number) => {
  emit('pageChange', page);
  emit('update:currentPage', page);
};
</script>

<style scoped>
.songs-list-container {
  overflow: clip;
}
.songs-list-container :deep(.ant-pagination-options) {
  display: none;
}
* {
  user-select: none;
}
.songs-list-container :deep(.icon-img) {
  width: 48px;
  height: 48px;
  border-radius: 8px;
}
.songs-list-container :deep(.ant-pagination-item-link) {
  height: 32px;
  display: block;
  position: relative;
  top: -3px;
}
.songs-list-container :deep(.ant-menu) {
  background: transparent;
}
.songs-list-container :deep(.ant-menu-item) {
  background: var(--y-com-bg) !important;
  margin-bottom: 15px;
  padding: 16px;
  border: rgb(239, 239, 245) 1px solid;
  display: inline-table !important;
  align-items: center !important;
}
[theme-dark] .songs-list-container :deep(.ant-menu-item) {
  border: rgba(255, 255, 255, 0.09) 1px solid;
}

.songs-list-container :deep(.ant-menu) {
  border: 0;
}
.songs-list-container :deep(.ant-menu-item-selected) {
  border: #70baff 1px solid !important;
  background: #70baff1f !important;
  span {
    color: #70baff;
  }
}

.songs-list-container :deep(.ant-menu-item-active) {
  border: #70baff 1px solid !important;
}
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
  margin-left: 20px;
}
.info {
  display: flex;
  margin-left: 16px;
  align-items: center;
  margin-top: 3px;
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
.rank span {
  font-size: 17px;
}
.rank {
  width: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>

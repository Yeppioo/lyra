<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <a-menu :disabled="loading" v-model:selectedKeys="current" mode="vertical">
      <a-menu-item
        @click="handleMenuItemClick(item.id, item.picUrl)"
        :disabled="loading"
        v-for="item in songsList"
        :key="item.id">
        <a-skeleton avatar :title="false" v-if="loading" active>
          <a-list-item-meta>
            <template #avatar>
              <a-avatar />
            </template>
          </a-list-item-meta>
        </a-skeleton>
        <div class="item" v-else>
          <a-image
            :fallback="fallbackImg"
            :placeholder="true"
            class="icon-img"
            :width="48"
            :preview="false"
            :height="48"
            :src="item.picUrl">
          </a-image>
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
            <a @click.stop="jumper.jumpAlbum(item.album.id)" class="album no-before">{{
              item.album.name
            }}</a>
            <span class="duration">{{ formatSecondsToMinutes(item.duration / 1000) }}</span>
            <font-awesome-icon class="more-button" size="xl" :icon="['fas', 'ellipsis']" />
          </div>
        </div>
      </a-menu-item>
    </a-menu>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { usePlayerStore, setCurrentSong } from '@/stores/player';
import { onMounted, ref, watch } from 'vue';
import { artist } from '../../api/netease';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { fallbackImg } from '@/stores/constant';
import * as jumper from '@/utils/jumper';

const route = useRoute();
const songsList = ref<any[]>([]);
const loading = ref(true);
const current = ref<string[]>([]);

const fetchSongs = async (key: string) => {
  loading.value = true;
  songsList.value = [...new Array(3)].map(() => ({ loading: true, name: {}, picture: {} }));

  const result = await artist.getArtistTopSongs(key);
  songsList.value = result.data.songs.map((s: any) => ({
    id: s.id,
    name: s.name,
    artists: s.ar,
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
  }));
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
    fetchSongs(key);
  }
});

const playerStore = usePlayerStore();
const handleMenuItemClick = async (key: number, cover: string) => {
  const songId = key;
  const song = songsList.value.find((s: any) => s.id == songId);
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
  } catch {
    message.error('播放失败');
  }
};

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

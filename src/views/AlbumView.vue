<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main v-if="albumDetail" class="album-view-container">
    <div class="album-content-wrapper">
      <div v-if="albumDetail" class="album-header">
        <a-image
          :src="albumDetail.picUrl"
          :width="200"
          :height="200"
          :preview="false"
          class="album-cover" />
        <div class="album-info">
          <h1 class="album-name">{{ albumDetail.name }}</h1>
          <div class="artist-info">
            <font-awesome-icon :icon="['fas', 'user']" />
            <a @click="jumpArtist(albumDetail.artist.id)" class="artist-name">{{
              albumDetail.artist.name
            }}</a>
          </div>
          <div class="publish-time">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span>{{ formatTimestampToDate(albumDetail.publishTime) }}</span>
          </div>
          <div class="description">
            <p>{{ albumDetail.description || '太懒了吧，连简介都不写' }}</p>
          </div>
          <div class="actions">
            <a-button type="primary" @click="playAllSongs">
              <font-awesome-icon style="color: #fff" :icon="['fas', 'play']" />
              <span style="color: #fff; margin-left: 5px">播放</span>
            </a-button>
          </div>
        </div>
      </div>
      <div class="song-list-section">
        <SongList :showRank="true" :hideAlbum="true" :songs="songList" :loading="loading" />
      </div>
    </div>
  </main>
  <div v-else class="album-view-container">
    <div class="song-list-section">
      <SongList :showRank="true" :hideAlbum="true" :songs="[]" :loading="true" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { album } from '@/api/netease';
import type { AlbumDetail, AlbumSong } from '@/api/netease/album';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';
import { formatTimestampToDate } from '@/utils/time';
import { message } from 'ant-design-vue';
import { jumpArtist } from '@/utils/jumper';
import { setCurrentSong, usePlayerStore } from '@/stores/player';
import type { SongInfo } from '@/types/player';

const route = useRoute();

const currentId = ref('');
const albumDetail = ref<AlbumDetail | null>(null);
const songList = ref<SongListItem[]>([]);
const loading = ref(true);

onMounted(() => {
  currentId.value = route.params.key as string;
  fetchInfo();
});

watch(
  () => route.params.key,
  (newId) => {
    if (newId) {
      currentId.value = newId as string;
      fetchInfo();
    }
  }
);

async function fetchInfo() {
  loading.value = true;
  try {
    const albumResponse = await album.getAlbumDetail(currentId.value);
    albumDetail.value = albumResponse.album;

    songList.value = albumResponse.songs.map((song: AlbumSong) => ({
      id: song.id,
      name: song.name,
      artists: song.ar.map((ar) => ({ id: ar.id, name: ar.name })),
      album: { id: song.al.id, name: song.al.name, picUrl: albumResponse.album.picUrl },
      duration: song.dt,
      picUrl: albumResponse.album.picUrl, // Fallback to album pic_str
      hasMv: song.mv !== 0,
      mvId: song.mv,
      requireVip: song.fee === 1,
    }));
  } catch (error) {
    message.error('获取专辑详情失败');
    console.error('Error fetching album detail:', error);
  } finally {
    loading.value = false;
  }
}

function playAllSongs() {
  const playerstore = usePlayerStore();
  playerstore.state.playListGroup.push({
    name: albumDetail.value?.name as string,
    songs: songList.value.map(
      (song) =>
        ({
          id: song.id,
          name: song.name,
          artist: song.artists,
          duration: song.duration,
          cover: song.picUrl,
        }) as SongInfo
    ),
    songIndex: 0,
    canDelete: true,
  });
  playerstore.state.groupIndex = playerstore.state.playListGroup.length - 1;
  playerstore.currentSongId = null;
  setTimeout(() => {
    setCurrentSong(
      {
        id: songList.value[0].id,
        duration: songList.value[0].duration,
        name: songList.value[0].name,
        artist: songList.value[0].artists,
        cover: songList.value[0].picUrl,
      },
      playerstore
    );
  }, 1);
}
</script>

<style scoped>
* {
  color: var(--y-text);
}
.songs-list-container {
  margin-bottom: 40px;
}
.album-content-wrapper {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap; /* Allow items to wrap to the next line */
  gap: 30px; /* Space between album info and song list */
}

.album-header {
  display: flex;
  margin-bottom: 30px;
  flex: 1; /* Allow album header to take available space */
}
.album-header:deep(img) {
  width: 200px;
  height: 200px;
  border-radius: 10px;
}
.album-cover {
  border-radius: 8px;
  margin-right: 30px;
}

.album-info {
  display: flex;
  flex-direction: column;
  margin-left: 40px;
  justify-content: center;
}

.album-name {
  font-size: 26px;
  font-weight: bold;
  margin-bottom: 2px;
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  text-overflow: ellipsis;
  overflow: hidden;
}

.artist-info,
.publish-time,
.description {
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  color: var(--y-text);
}

.description p {
  margin: 0px !important;
  display: -webkit-box;
  word-wrap: break-word;
  text-wrap: auto;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  text-overflow: ellipsis;
  overflow: hidden;
}

.artist-info .artist-name {
  margin-left: 8px;
  font-size: 14px;
  font-family: var(--y-font);
  cursor: pointer;
}
.artist-info .artist-name:hover {
  color: #1677ff;
}

.publish-time span {
  margin-left: 8px;
  font-size: 14px;
}

.description p {
  margin-left: 8px;
  font-size: 14px;
  line-height: 1.5;
  max-width: 600px;
}

.actions {
  margin-top: 10px;
}

.actions .ant-btn {
  margin-right: 10px;
}

.song-list-section {
  margin-top: 0; /* Reset margin-top for flex layout */
  flex: 2; /* Allow song list to take more space */
}

.song-list-section h2 {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}
@media (max-width: 768px) {
  .album-header {
    flex-direction: column;
    align-items: center;
  }
  .album-info {
    margin-left: 0;
    margin-top: 30px;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main v-if="playlist" class="album-view-container">
    <div class="album-content-wrapper">
      <div v-if="playlist" class="album-header">
        <a-image
          :src="playlist.coverImgUrl"
          :width="200"
          :height="200"
          :preview="false"
          class="album-cover" />
        <div class="album-info">
          <h1 class="album-name">{{ playlist.name }}</h1>
          <div class="artist-info">
            <font-awesome-icon :icon="['fas', 'user']" />
            <a @click="jumper.jumpUser(playlist.creator.userId)" class="artist-name">{{
              playlist.creator.nickname
            }}</a>
          </div>
          <div class="publish-time">
            <font-awesome-icon :icon="['fas', 'clock']" />
            <span>{{ formatTimestampToDate(playlist.createTime) }} | {{ formatTimestampToDate(playlist.updateTime) }}</span>
          </div>
          <div class="publish-time">
            <font-awesome-icon :icon="['fas', 'earth-americas']" />
            <span>{{ formatNumber(playlist.trackCount) }}首音乐 | {{ formatNumber(playlist.playCount) }}次播放</span>
          </div>
          <div class="description">
            <p>{{ playlist.description || '太懒了吧，连简介都不写' }}</p>
          </div>
          <div class="actions">
            <a-button disabled v-if="isPlayAllLoading" type="primary" @click="playAllSongs">
              <font-awesome-icon style="color: #fff" :icon="['fas', 'arrows-rotate']" />
              <span style="color: #fff; margin-left: 5px">加载中</span>
            </a-button>
            <a-button v-else type="primary" @click="playAllSongs">
              <font-awesome-icon style="color: #fff" :icon="['fas', 'play']" />
              <span style="color: #fff; margin-left: 5px">播放</span>
            </a-button>
          </div>
        </div>
      </div>
      <div class="song-list-section">
        <SongList
        :songs="songs"
        :loading="loading"
        :show-pagination="true"
        :total-songs="totalSongs"
        :current-page="currentPage"
        @page-change="onPageChange"
        @update:currentPage="onPageChange" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import { playlist as playlistApi } from '@/api/netease';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';
import { message } from 'ant-design-vue';
import { formatNumber, formatTimestampToDate } from '@/utils/time';
import { usePlayerStore, setCurrentSong, type PlayingSongInfo } from '@/stores/player';
import * as jumper from '@/utils/jumper';

interface Playlist {
  id: number;
  name: string;
  coverImgUrl: string;
  creator: {
    userId: number;
    nickname: string;
  };
  playCount: number;
  trackCount: number;
  description: string;
  tags: string[];
  updateTime: number;
  createTime: number;
}

interface Artist {
  id: number;
  name: string;
}

interface Album {
  id: number;
  name: string;
  picUrl: string;
}

interface Song {
  id: number;
  name: string;
  ar: Artist[];
  al: Album;
  dt: number;
  mv: number;
  fee: number;
}

const route = useRoute();

const isPlayAllLoading = ref(false);

const playAllSongs = async () => {
  isPlayAllLoading.value = true;
  const playerStore = usePlayerStore();
  try {
    const allSongs: SongListItem[] = [];
    const totalPages = Math.ceil(totalSongs.value / pageSize.value);
    const fetchPromises = [];

    for (let i = 0; i < totalPages; i++) {
      const offset = i * pageSize.value;
      fetchPromises.push(
        playlistApi.playlistTrackAll(Number(currentId.value), pageSize.value, offset)
      );
    }

    const responses = await Promise.all(fetchPromises);
    responses.forEach((response) => {
      if (response.code === 200 && response.songs) {
        response.songs.forEach((song: Song) => {
          allSongs.push({
            id: song.id,
            name: song.name,
            artists: song.ar.map((artist: Artist) => ({ id: artist.id, name: artist.name })),
            album: { id: song.al.id, name: song.al.name, picUrl: song.al.picUrl },
            duration: song.dt,
            picUrl: song.al.picUrl,
            hasMv: song.mv !== 0,
            mvId: song.mv,
            requireVip: song.fee === 1 || song.fee === 8,
          });
        });
      }
    });

    if (allSongs.length > 0) {
      playerStore.state.playListGroup.push({
        name: playlist.name,
        songs: allSongs.map(
          (song) =>
            ({
              id: song.id,
              name: song.name,
              artist: song.artists,
              duration: song.duration,
              cover: song.picUrl,
            }) as PlayingSongInfo
        ),
        songIndex: 0,
        canDelete: true,
      });
      playerStore.state.groupIndex = playerStore.state.playListGroup.length - 1;
      playerStore.currentSongId = null;
      setTimeout(() => {
        setCurrentSong(
          {
            id: allSongs[0].id,
            duration: allSongs[0].duration,
            name: allSongs[0].name,
            artist: allSongs[0].artists,
            cover: allSongs[0].picUrl,
          },
          playerStore
        );
      }, 1);
    } else {
      message.warn('歌单中没有歌曲可播放');
    }
  } catch (error) {
    message.error('播放所有歌曲失败');
    console.error(error);
  } finally {
    isPlayAllLoading.value = false;
  }
};

const currentId = ref('');
const playlist = reactive<Playlist>({
  id: 0,
  name: '',
  coverImgUrl: '',
  creator: { userId: 0, nickname: '' },
  playCount: 0,
  trackCount: 0,
  description: '',
  tags: [],
  updateTime: 0,
  createTime: 0,
});
const songs = ref<SongListItem[]>([]);
const loading = ref(true);
const totalSongs = ref(0);
const currentPage = ref(1);
const pageSize = ref(15);

const fetchPlaylistDetail = async (id: string) => {
  loading.value = true;
  try {
    const response = await playlistApi.playlistDetail(Number(id));
    if (response.code === 200 && response.playlist) {
      Object.assign(playlist, response.playlist);
      totalSongs.value = response.playlist.trackCount;
    } else {
      message.error('获取歌单详情失败');
    }
  } catch (error) {
    message.error('获取歌单详情异常');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const fetchPlaylistSongs = async (id: string, offset: number) => {
  loading.value = true;
  try {
    const response = await playlistApi.playlistTrackAll(Number(id), pageSize.value, offset);
    if (response.code === 200 && response.songs) {
      songs.value = response.songs.map((song: Song) => ({
        id: song.id,
        name: song.name,
        artists: song.ar.map((artist: Artist) => ({ id: artist.id, name: artist.name })),
        album: { id: song.al.id, name: song.al.name, picUrl: song.al.picUrl },
        duration: song.dt,
        picUrl: song.al.picUrl,
        hasMv: song.mv !== 0,
        mvId: song.mv,
        requireVip: song.fee === 1 || song.fee === 8, // Assuming fee 1 or 8 means VIP
      }));
    } else {
      message.error('获取歌单歌曲失败');
    }
  } catch (error) {
    message.error('获取歌单歌曲异常');
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const loadPlaylistData = async (id: string, page: number) => {
  const offset = (page - 1) * pageSize.value;
  await fetchPlaylistDetail(id);
  await fetchPlaylistSongs(id, offset);
};

onMounted(() => {
  currentId.value = route.params.key as string;
  if (currentId.value) {
    loadPlaylistData(currentId.value, currentPage.value);
  }
});

watch(
  () => route.params.key,
  (newId) => {
    if (newId) {
      currentId.value = newId as string;
      currentPage.value = 1; // Reset to first page when ID changes
      loadPlaylistData(currentId.value, currentPage.value);
    }
  }
);

const onPageChange = (page: number) => {
  currentPage.value = page;
  loadPlaylistData(currentId.value, currentPage.value);
};
</script>

<style scoped>
* {
  color: var(--y-text);
}
.songs-list-container{
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
  -webkit-line-clamp: 2;
  line-clamp: 2;
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
  .album-info{
    margin-left: 0;
    margin-top: 30px;
  }
}
</style>

<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main class="song-view">
    <div v-if="songDetail" class="song-detail-container">
      <div class="album-cover">
        <img :src="songDetail.al.picUrl" alt="Album Cover" />
      </div>
      <div class="song-info">
        <h1 class="song-name">{{ songDetail.name }}</h1>
        <div class="artist-info">
          <font-awesome-icon class="icon user" :icon="['fas', 'user']" />
          <div class="ar-name-container">
            <template v-for="a in songDetail.ar" :key="a.id">
              <a @click.stop="jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
            </template>
          </div>
        </div>
        <div class="album-info">
          <font-awesome-icon class="icon album" :icon="['fas', 'compact-disc']" />
          <a @click="jumpAlbum(songDetail.al.id)" class="link">
            {{ songDetail.al.name }}
          </a>
        </div>
        <button @click="playCurrent" class="play-button">
          <font-awesome-icon class="icon" :icon="['fas', 'play']" />播放
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { getSong } from '@/api/netease';
import { jumpArtist, jumpAlbum } from '@/utils/jumper';
import type { SongDetail } from '@/api/netease/getSong';
import { setCurrentSong, usePlayerStore } from '@/stores/player';

const route = useRoute();

const currentId = ref('');
const songDetail = ref<SongDetail | null>(null);
const playerStore = usePlayerStore();

const fetchInfo = async () => {
  if (!currentId.value) return;
  const response = await getSong.getSongDetail(currentId.value);
  if (response.songs && response.songs.length > 0) {
    songDetail.value = response.songs[0];
  }
};

onMounted(() => {
  currentId.value = route.params.key as string;
  fetchInfo();
});

watch(
  () => route.params.key,
  async (newId) => {
    if (newId) {
      currentId.value = newId as string;
      await fetchInfo();
    }
  }
);

const playCurrent = () => {
  if (songDetail.value) {
    setCurrentSong(
      {
        id: songDetail.value.id,
        duration: songDetail.value.dt,
        name: songDetail.value.name,
        artist: songDetail.value.ar,
        cover: songDetail.value.al.picUrl,
      },
      playerStore
    );
  }
};
</script>

<style scoped>
.song-view {
  padding: 20px;
}

.song-detail-container {
  display: flex;
  align-items: flex-start;
  gap: 40px;
  border-radius: 12px;
}

.album-cover {
  flex-shrink: 0;
  width: 250px;
  height: 250px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.album-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.song-info {
  flex-grow: 1;
  display: flex;
  margin-top: 10px;
  position: relative;
  flex-direction: column;
  height: 240px;
  justify-content: flex-start;
}

.song-name {
  font-size: 36px;
  color: var(--y-text);
  line-height: 1.3;
  margin: 0;
}

.artist-info,
.album-info {
  font-size: 18px;
  color: var(--y-text);
  display: flex;
  align-items: center;
  margin-top: 5px;
}

.artist-info .link,
.album-info .link {
  color: var(--y-text);
  text-decoration: none;
  transition: color 0.2s ease-in-out;
  cursor: pointer;
}

.artist-info .link + .link {
  margin-left: 5px;
}
.play-button .icon {
  color: white;
  margin-right: 5px;
}
.play-button {
  background-color: #70baffb9;
  color: white;
  border: none;
  border-radius: 6px;
  line-height: 1;
  padding: 10px;
  font-family: var(--y-font);
  font-size: 15px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
  display: flex;
  align-items: center;
  position: absolute;
  bottom: 10px;
}

.play-button:hover {
  background-color: #70baff;
}

.play-button i {
  font-size: 20px;
}

.ar-name,
.album-info > a {
  margin-top: 2px;
  font-size: 16px;
  color: #909092 !important;
  padding: 0;
  min-width: 35px;
  font-family: var(--y-font);
  cursor: pointer;
  margin-left: 1px;
}
.ar-name ~ .ar-name::before {
  content: ',';
  margin: 0 4px 0 3px;
  color: #909092 !important;
}
.ar-name::before {
  position: static !important;
  display: inline;
}
.ar-name:hover,
.album-info > a:hover {
  color: #1677ff !important;
  cursor: pointer;
}
.ar-name-container {
  display: flex;
  flex-direction: row;
  white-space: wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  line-clamp: 3;
}
.icon.album {
  color: #FAAD14;
  width: 22px;
  margin-left: 2px;
  margin-right: 2px;
}
.icon.user {
  color: #ff4d4f;
  width: 26px;
}

@media (max-width: 784px) {
  .song-detail-container {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .song-info {
    height: auto;
    align-items: center;
  }

  .play-button {
    position: static;
    margin-top: 20px;
  }
}
</style>

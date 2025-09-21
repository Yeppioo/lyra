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

    <div v-if="songWikiSummary" class="song-wiki-summary">
      <h2 class="section-title">音乐百科</h2>
      <div v-for="block in songWikiSummary.blocks" :key="block.id" class="wiki-block">
        <h3 class="block-title">{{ block.uiElement.mainTitle.title }}</h3>
        <div v-if="block.creatives && block.creatives.length > 0" class="creatives-container">
          <div
            v-for="creative in block.creatives"
            :key="creative.creativeType"
            class="creative-item">
            <h4 v-if="creative.uiElement.mainTitle" class="creative-title">
              {{ creative.uiElement.mainTitle.title }}
            </h4>
            <div v-if="creative.resources" class="resources-container">
              <div
                v-for="resource in creative.resources"
                :key="resource.resourceType"
                class="resource-item">
                <span v-if="resource.uiElement.mainTitle">{{
                  resource.uiElement.mainTitle.title
                }}</span>
                <span
                  v-if="
                    resource.uiElement.descriptions && resource.uiElement.descriptions.length > 0
                  ">
                  {{ resource.uiElement.descriptions[0].description }}
                </span>
                <img
                  v-if="resource.uiElement.images && resource.uiElement.images.length > 0"
                  :src="resource.uiElement.images[0].imageUrl"
                  class="resource-image" />
              </div>
            </div>
            <div
              v-if="creative.uiElement.textLinks && creative.uiElement.textLinks.length > 0"
              class="text-links-container">
              <a
                v-for="link in creative.uiElement.textLinks"
                :key="link.text"
                :href="link.url || '#'"
                target="_blank"
                class="text-link"
                >{{ link.text }}</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hotComments.length > 0" class="hot-comments-section">
      <h2 class="section-title">热门评论</h2>
      <div v-for="comment in displayedComments" :key="comment.commentId" class="comment-item">
        <div class="comment-user-info">
          <img :src="comment.user.avatarUrl" alt="User Avatar" class="user-avatar" />
          <span class="nickname">{{ comment.user.nickname }}</span>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <div class="comment-meta">
          <span class="time">{{ comment.timeStr }}</span>
          <span class="liked-count">
            <font-awesome-icon :icon="['fas', 'thumbs-up']" /> {{ comment.likedCount }}
          </span>
        </div>
      </div>
      <div v-if="hotComments.length > 1" class="comment-toggle-buttons">
        <button v-if="!showAllComments" @click="showAllComments = true" class="toggle-button">
          <font-awesome-icon :icon="['fas', 'chevron-down']" /> 展开评论
        </button>
        <button v-if="showAllComments" @click="showAllComments = false" class="toggle-button">
           <font-awesome-icon :icon="['fas', 'chevron-up']" /> 收起评论
        </button>
      </div>
    </div>

    <div v-if="simiSongs.length > 0" class="similar-songs-section">
      <h2 class="section-title">相似推荐</h2>
      <div class="similar-songs-grid">
        <div v-for="song in simiSongs" :key="song.id" class="similar-song-item">
          <img :src="song.album.picUrl" alt="Album Cover" class="similar-song-cover" />
          <div class="similar-song-info">
            <p class="similar-song-name">{{ song.name }}</p>
            <p class="similar-song-artist">{{ song.artists.map((a) => a.name).join(', ') }}</p>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getSong, comment, simi } from '@/api/netease';
import { jumpArtist, jumpAlbum } from '@/utils/jumper';
import type { SongDetail } from '@/api/netease/getSong';
import type { HotComment } from '@/api/netease/comment';
import type { SimiSong } from '@/api/netease/simi';
import { setCurrentSong, usePlayerStore } from '@/stores/player';
import type { SongWikiSummaryResponseData } from '@/api/netease/songWiki';

const route = useRoute();

const currentId = ref('');
const songDetail = ref<SongDetail | null>(null);
const hotComments = ref<HotComment[]>([]);
const songWikiSummary = ref<SongWikiSummaryResponseData | null>(null);
const simiSongs = ref<SimiSong[]>([]);
const showAllComments = ref(false); // 新增：控制评论展开/收起状态
const playerStore = usePlayerStore();

const displayedComments = computed(() => {
  if (showAllComments.value) {
    return hotComments.value;
  }
  return hotComments.value.slice(0, 1); // 默认只显示第一条评论
});

const fetchInfo = async () => {
  if (!currentId.value) return;
  const songDetailResponse = await getSong.getSongDetail(currentId.value);
  if (songDetailResponse.songs && songDetailResponse.songs.length > 0) {
    songDetail.value = songDetailResponse.songs[0];
  }

  // 获取热门评论
  const commentsResponse = await comment.getHotComments(currentId.value, 0); // type 0 for song
  hotComments.value = commentsResponse.hotComments;

  // 获取相似歌曲
  const simiResponse = await simi.getSimiSongs(currentId.value);
  simiSongs.value = simiResponse.songs;
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
  max-width: 1200px;
  margin: 0 auto;
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
  color: #faad14;
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

.section-title {
  font-size: 24px;
  color: var(--y-text);
  margin-top: 20px;
  margin-bottom: 0px;
  padding-bottom: 10px;
}

/* Song Wiki Summary Styles */
.song-wiki-summary {
  margin-top: 40px;
}

.wiki-block {
  background-color: var(--y-background-card);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.block-title {
  font-size: 20px;
  color: var(--y-text);
  margin-bottom: 15px;
}

.creatives-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.creative-item {
  flex: 1;
  min-width: 200px;
  background-color: var(--y-background);
  border-radius: 6px;
  padding: 15px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03);
}

.creative-title {
  font-size: 16px;
  color: var(--y-text-light);
  margin-bottom: 10px;
}

.resources-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.resource-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--y-text);
  font-size: 14px;
}

.resource-image {
  width: 50px;
  height: 50px;
  border-radius: 4px;
  object-fit: cover;
}

.text-links-container {
  margin-top: 10px;
}

.text-link {
  color: #1677ff;
  text-decoration: none;
  margin-right: 15px;
  font-size: 14px;
}

.text-link:hover {
  text-decoration: underline;
}

/* Hot Comments Styles */
.hot-comments-section {
  margin-top: 40px;
}

.comment-toggle-buttons {
  display: flex;
  justify-content: flex-start;
  margin-top: 0px;
  margin-left: 5px;
}

.toggle-button {
  background-color: transparent;
  color: white;
  border: none;
  border-radius: 6px;
  position: relative;
  left: 0;
  font-family: var(--y-font);
  font-size: 15px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}



.comment-item {
  background: var(--y-com-bg) !important;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  border: 1px solid;
}
.comment-item:hover {
  border: #70baff 1px solid !important;
}

.comment-user-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
  object-fit: cover;
}

.nickname {
  font-weight: bold;
  color: var(--y-text);
}

.comment-content {
  color: var(--y-text);
  line-height: 1.6;
  margin-bottom: 10px;
}

.comment-meta {
  display: flex;
  align-items: center;
  font-size: 13px;
  color: var(--y-text);
}

.comment-meta .time {
  margin-right: 15px;
}

.comment-meta .liked-count {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* Similar Songs Styles */
.similar-songs-section {
  margin-top: 40px;
}

.similar-songs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.similar-song-item {
  background-color: var(--y-background-card);
  border-radius: 8px;
  padding: 15px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.similar-song-item:hover {
  transform: translateY(-5px);
}

.similar-song-cover {
  width: 120px;
  height: 120px;
  border-radius: 6px;
  object-fit: cover;
  margin-bottom: 10px;
}

.similar-song-info {
  width: 100%;
}

.similar-song-name {
  font-weight: bold;
  color: var(--y-text);
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.similar-song-artist {
  color: var(--y-text-light);
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

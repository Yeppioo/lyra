<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main class="song-view">
    <div v-if="songDetail" class="song-detail-container">
      <div class="album-cover">
        <img :src="songDetail.al.picUrl" alt="Album Cover" />
      </div>
      <div class="song-info">
        <h1 class="song-name-title">{{ songDetail.name }}</h1>
        <div class="artist-info">
          <font-awesome-icon class="icon user" :icon="['fas', 'user']" />
          <div class="ar-name-container">
            <template v-for="a in songDetail.ar" :key="a.id">
              <a @click.stop="jumpArtist(a.id)" class="ar-name">{{ a.name }}</a>
            </template>
          </div>
        </div>
        <div class="album-info">
          <font-awesome-icon class="icon album-icon" :icon="['fas', 'compact-disc']" />
          <a @click="jumpAlbum(songDetail.al.id)" class="link">
            {{ songDetail.al.name }}
          </a>
        </div>
        <div class="buttons">
          <button @click="playCurrent" class="nth-1 play-button">
          <font-awesome-icon class="icon" :icon="['fas', 'play']" />播放
        </button>
        <button @click="jumpCustom(`/song/${currentId}/comment`)" class="play-button">
          <font-awesome-icon class="icon" :icon="['fas', 'message']" />评论
        </button>
        </div>
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
      <CommentList :comments="displayedComments as any[]" />
      <div v-if="hotComments.length > 1" class="comment-toggle-buttons">
        <button v-if="!showAllComments" @click="showAllComments = true" class="toggle-button">
          <font-awesome-icon :icon="['fas', 'chevron-down']" /> 展开评论
        </button>
        <button v-if="showAllComments" @click="showAllComments = false" class="toggle-button">
          <font-awesome-icon :icon="['fas', 'chevron-up']" /> 收起评论
        </button>
      </div>
    </div>

    <div v-if="simiSongs.length > 0" class="songs-search-result">
      <h2 class="section-title">相似推荐</h2>
      <SongList :songs="displayedSimiSongs" :loading="loading" />
      <div v-if="simiSongs.length > 1" class="comment-toggle-buttons">
        <button v-if="!showAllSimiSongs" @click="showAllSimiSongs = true" class="toggle-button">
          <font-awesome-icon :icon="['fas', 'chevron-down']" /> 展开推荐
        </button>
        <button v-if="showAllSimiSongs" @click="showAllSimiSongs = false" class="toggle-button">
          <font-awesome-icon :icon="['fas', 'chevron-up']" /> 收起推荐
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getSong, comment, simi } from '@/api/netease';
import { jumpArtist, jumpAlbum , jumpCustom } from '@/utils/jumper'; // Keep jumpArtist, jumpAlbum for songDetail section
import type { SongDetail } from '@/api/netease/getSong';
import type { HotComment } from '@/api/netease/comment';
import type { SimiSong } from '@/api/netease/simi';
import { setCurrentSong, usePlayerStore } from '@/stores/player'; // Re-added setCurrentSong
import type { SongWikiSummaryResponseData } from '@/api/netease/songWiki';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';
import CommentList from '@/components/common/CommentList.vue';

const route = useRoute();

const currentId = ref('');
const songDetail = ref<SongDetail | null>(null);
const hotComments = ref<HotComment[]>([]);
const songWikiSummary = ref<SongWikiSummaryResponseData | null>(null);
const simiSongs = ref<SongListItem[]>([]);
const showAllComments = ref(false); // 新增：控制评论展开/收起状态
const showAllSimiSongs = ref(false); // 新增：控制相似推荐展开/收起状态
const playerStore = usePlayerStore();
const loading = ref(true); // Added for similar songs section

const displayedComments = computed(() => {
  if (showAllComments.value) {
    return hotComments.value;
  }
  return hotComments.value.slice(0, 1); // 默认只显示第一条评论
});

const displayedSimiSongs = computed(() => {
  if (showAllSimiSongs.value) {
    return simiSongs.value;
  }
  return simiSongs.value.slice(0, 1); // 默认只显示前3条相似推荐
});

const fetchInfo = async () => {
  hotComments.value = [];
  simiSongs.value = [];
  songDetail.value = null;

  if (!currentId.value) return;

  (async () => {
    loading.value = true; // Set loading to true before fetching
    const simiResponse = await simi.getSimiSongs(currentId.value);
    simiSongs.value = simiResponse.songs.map((s: SimiSong) => ({
      id: s.id,
      name: s.name,
      artists: s.artists.map((a) => ({ id: a.id, name: a.name })), // Map artists to match SongListItem
      duration: s.duration,
      album: {
        id: s.album.id,
        name: s.album.name,
        picUrl: s.album.picUrl,
      },
      hasMv: s.mvid !== 0,
      mvId: s.mvid,
      requireVip: s.fee === 1,
      picUrl: s.album.picUrl,
    }));
    loading.value = false; // Set loading to false after fetching
  })();

  (async () => {
    const songDetailResponse = await getSong.getSongDetail(currentId.value);
    if (songDetailResponse.songs && songDetailResponse.songs.length > 0) {
      songDetail.value = songDetailResponse.songs[0];
    }
  })();

  (async () => {
    // 获取热门评论
    const commentsResponse = await comment.getHotComments(currentId.value, 0); // type 0 for song
    hotComments.value = commentsResponse.hotComments;
  })();
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
.songs-list-container :deep(.ant-menu) {
  background-color: transparent;
}
.songs-list-container {
  padding: 0;
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

.song-name-title {
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

}

.buttons{
    position: absolute;
  bottom: 10px;
  display: flex

}
.nth-1{
  margin-right: 10px;
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
  font-size: 14px;
  color: #909092 !important;
  padding: 0;
  min-width: 35px;
  font-family: var(--y-font);
  cursor: pointer;
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
.icon.album-icon {
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
.songs-search-result .ant-menu {
  background: transparent;
}
.toggle-button {
  background-color: transparent;
  color: var(--y-text);
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
  border: 1px solid transparent;
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
.songs-search-result {
  overflow: clip;
  padding-bottom: 40px;
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
.song-view {
  user-select: none;
}
.comment-item {
  user-select: text;
}
</style>

<template>
  <div class="container">
    <SongList :songs="displayedSong" :loading="loading" :loadingCount="1"/>
    <div style="margin-top: 20px;" class="title">
      <span style="font-size: 22px;">全部评论</span>
      <sup style="font-size: 16px;margin-left: 2px;">{{ commentCount }}</sup>
    </div>
    <div style="margin: 20px 0;margin-bottom: 40px;" class="comment-container">
      <CommentList :comments="comments" />
    </div>
    <div v-if="commentsLoading" class="loading-more">加载中...</div>
    <div v-if="!hasMoreComments && comments.length > 0" class="no-more-comments">
      没有更多评论了
    </div>
    <div v-if="comments.length === 0 && !commentsLoading" class="no-comments">
      暂无评论
    </div>
  </div>
</template>

<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { getSong, comment } from '@/api/netease';
import { onMounted, ref, watch, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import SongList, { type SongListItem } from '@/components/common/SongList.vue';
import CommentList, { type Comment } from '@/components/common/CommentList.vue';

const route = useRoute();
const currentId = ref('');
const displayedSong = ref<SongListItem[]>([]);
const loading = ref(false);
const commentCount = ref(0);
const comments = ref<Comment[]>([]);
const currentPage = ref(1);
const hasMoreComments = ref(true);
const commentsLoading = ref(false);
const currentCursor = ref<number | undefined>(undefined);
let appViewElement: HTMLElement | null = null;

onMounted(() => {
  currentId.value = route.params.key as string;
  appViewElement = document.getElementById('app-view');
  if (appViewElement) {
    appViewElement.addEventListener('scroll', handleScroll);
  } else {
    // Fallback to window if app-view is not found, though it should exist based on user feedback
    window.addEventListener('scroll', handleScroll);
  }
  fetchInfo();
  fetchComments(true);
});

watch(
  () => route.params.key,
  async (newId) => {
    if (newId) {
      currentId.value = newId as string;
      fetchInfo();
      fetchComments(true); // ID 变化时重新加载评论
    }
  }
);

const fetchInfo = async () => {
  // 获取歌曲列表信息
  (async () => {
    displayedSong.value = [];
    loading.value = true;
    const songDetailResponse = await getSong.getSongDetail(currentId.value);
    if (songDetailResponse.songs && songDetailResponse.songs.length > 0) {
      displayedSong.value = songDetailResponse.songs.map((song) => ({
        id: song.id,
        name: song.name,
        artists: song.ar.map((artist) => ({
          id: artist.id,
          name: artist.name,
        })),
        album: {
          id: song.al.id,
          name: song.al.name,
          picUrl: song.al.picUrl,
        },
        duration: song.dt,
        hasMv: song.mv !== 0,
        mvId: song.mv,
        requireVip: song.fee === 1,
        picUrl: song.al.picUrl,
      }));
    }
    loading.value = false;
  })();
};

const fetchComments = async (reset = false) => {
  if (commentsLoading.value || (!hasMoreComments.value && !reset)) {
    return;
  }
  commentsLoading.value = true;
  try {
    if (reset) {
      comments.value = [];
      currentPage.value = 1;
      currentCursor.value = undefined;
      hasMoreComments.value = true;
    }

    const response = await comment.getNewComments(
      currentId.value,
      0, // 歌曲类型为 0
      1, // 按推荐排序
      currentPage.value,
      20, // 每页 20 条
      currentCursor.value
    );

    const data = response.data;

    if (data.comments && data.comments.length > 0) {
      comments.value = [...comments.value, ...data.comments];
      commentCount.value = data.totalCount;
      hasMoreComments.value = data.hasMore;
      if (data.comments.length > 0) {
        currentCursor.value = data.comments[data.comments.length - 1].time;
      }
      currentPage.value++;
    } else {
      hasMoreComments.value = false;
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
  } finally {
    commentsLoading.value = false;
  }
};

const handleScroll = () => {
  const targetElement = appViewElement || document.documentElement; // Fallback to document.documentElement if appViewElement is null

  const scrollHeight = targetElement.scrollHeight;
  const scrollTop = targetElement.scrollTop;
  const clientHeight = targetElement.clientHeight;


  if (scrollTop + clientHeight >= scrollHeight - 200 && hasMoreComments.value && !commentsLoading.value) {
    fetchComments();
  }
};

onUnmounted(() => {
  if (appViewElement) {
    appViewElement.removeEventListener('scroll', handleScroll);
  } else {
    window.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped>
span,sup{
  color: var(--y-text);
  font-family: var(--y-font);
}

.loading-more, .no-more-comments, .no-comments {
  text-align: center;
  padding: 20px;
  color: var(--y-text);
  font-family: var(--y-font);
  margin-bottom: 40px;
}
</style>

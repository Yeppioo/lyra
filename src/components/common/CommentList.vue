<template>
    <div v-for="comment in comments" :key="comment.commentId" class="comment-item">
      <div class="comment-user-info">
        <img :src="comment.user.avatarUrl" alt="User Avatar" class="user-avatar" />
        <a @click="jumpUser(comment.user.userId)" class="nickname">{{ comment.user.nickname }}</a>
      </div>
      <p class="comment-content">{{ comment.content }}</p>
      <div class="comment-meta">
        <span class="time">{{ comment.timeStr }}</span>
        <span class="liked-count">
          <font-awesome-icon :icon="['fas', 'thumbs-up']" /> {{ comment.likedCount }}
        </span>
      </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { jumpUser } from '@/utils/jumper';

export interface Comment {
  commentId: string;
  user: {
    userId: string;
    nickname: string;
    avatarUrl: string;
  };
  timeStr: string;
  likedCount: string;
  content: string;
}

defineProps<{
  comments: Comment[];
}>();
</script>

<style scoped>
.comments-section {
  margin-top: 40px;
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
  margin-right: 15px;
  object-fit: cover;
}

.nickname {
  font-size: 16px;
  color: var(--y-text);
  font-family: var(--y-font);
  cursor: pointer;
}
.nickname:hover{
  color: #1677FF;
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
.comment-item {
  user-select: text;
}
</style>

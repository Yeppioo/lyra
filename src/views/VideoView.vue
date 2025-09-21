<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="container">
    <main class="video-view">
      <div class="text">
        <p v-if="mvDetail" class="mv-title">{{ mvDetail.name }} - {{ mvDetail?.artistName }}</p>

        <div class="infos">
          <div class="info-item" v-if="mvDetail?.playCount">
            <font-awesome-icon class="info-icon" :icon="['fas', 'video']" size="lg" />
            <span class="info-text" style="  margin-left: 8px;"> {{ formatNumber(mvDetail?.playCount) }}</span>
          </div>

          <div class="info-item" v-if="mvDetail?.playCount">
            <font-awesome-icon
              class="info-icon"
              :icon="['fas', 'square-arrow-up-right']"
              size="lg" />
            <span style="  margin-left: 6px;" class="info-text"> {{ formatNumber(mvDetail?.shareCount) }}</span>
          </div>
          <div class="info-item" v-if="mvDetail?.playCount">
            <font-awesome-icon class="info-icon" :icon="['fas', 'message']" size="lg" />
            <span style="  margin-left: 8px;" class="info-text"> {{ formatNumber(mvDetail?.commentCount) }}</span>
          </div>
        </div>
      </div>
      <div v-if="mvUrl" class="video-container">
        <video :src="mvUrl" controls autoplay></video>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { mv } from '@/api/netease';
import type { MvDetailResponse } from '@/api/netease/mv';
import { formatNumber } from '@/utils/time';

const route = useRoute();

const currentId = ref('');
const mvDetail = ref<MvDetailResponse['data'] | null>(null);
const mvUrl = ref<string | null>(null);

const fetchMvData = async (id: string) => {
  try {
    const detailRes = await mv.getMvDetail(id);
    mvDetail.value = detailRes.data;

    const urlRes = await mv.getMvUrl(id);
    mvUrl.value = urlRes.data.url;
  } catch (error) {
    console.error('Error fetching MV data:', error);
    mvDetail.value = null;
    mvUrl.value = null;
  }
};

onMounted(() => {
  currentId.value = route.params.key as string;
  if (currentId.value) {
    fetchMvData(currentId.value);
  }
});

watch(
  () => route.params.key,
  (newId) => {
    if (newId) {
      currentId.value = newId as string;
      fetchMvData(currentId.value);
    }
  }
);
</script>

<style scoped>
.title {
  display: flex;
  align-items: flex-end;
}
.text {
  display: flex;
  width: 100%;
  max-width: 900px;
  flex-direction: column;
  align-items: flex-start;
}
.container {
  display: flex;
  justify-content: center;
}
.video-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  width: 100%;
}

.video-container {
  width: 100%;
  margin-bottom: 20px;
  position: relative;
  padding-bottom: min(
    56%,
    504px
  ); /* 16:9 比例，高度是宽度的 9/16 = 56.25%，这里使用 45% 是为了让视频播放器在页面上看起来更协调，可以根据实际情况调整 */
  overflow: hidden;
  background-color: black;
  max-width: 900px;
  max-height: 504px;
}

.video-container video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  max-width: 900px;
  max-height: 504px;
  height: 100%;
  border-radius: 8px;
}

.mv-info {
  width: 80%;
  max-width: 1200px;
  background-color: var(--color-background-soft);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.mv-title {
  font-size: 30px;
  margin-bottom: 0px;
  color: var(--y-text);
  text-align: center;
}

.mv-info p {
  margin-bottom: 5px;
  color: var(--y-text);
}
.info-text {
  color: var(--y-text);
  font-family: var(--y-font);
  margin-left: 5px;
}
.infos {
  margin-left: 0px;
  margin-bottom: 10px;
  display: flex
;
    flex-direction: row;
}
.info-item{
  margin-right: 15px;
}
</style>

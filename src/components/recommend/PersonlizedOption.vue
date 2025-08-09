<template>
  <a-row :gutter="[16, 16]">
    <!-- 大块 -->
    <a-col :xs="24" :md="12">
      <div class="grid-item large-item">
        <div
          class="background-blur"
          :style="{
            backgroundImage: `url(${uiProperties.personalized.song30.songs[uiProperties.personalized.song30.selectedindex]?.pic})`,
          }"></div>
        <Song30 />
      </div>
    </a-col>
    <a-col :xs="24" :md="12">
      <a-row :gutter="[16, 16]">
        <a-col :span="24">
          <div class="grid-item small-item-1">2</div>
        </a-col>
        <a-col :span="24">
          <a-row :gutter="[16, 16]">
            <a-col :span="12">
              <div class="grid-item small-item-2-1">3</div>
            </a-col>
            <a-col :span="12">
              <div class="grid-item small-item-2-2">4</div>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-col>
  </a-row>
</template>

<script setup lang="ts">
import { Row as ARow, Col as ACol } from 'ant-design-vue';
import { useUIPropertiesStore } from '../../stores/uiProperties';
import { storeToRefs } from 'pinia';
import Song30 from './Song30.vue';

const uiPropertiesStore = useUIPropertiesStore();
const { uiProperties } = storeToRefs(uiPropertiesStore);
</script>

<style scoped>
.grid-item {
  background-color: #00000040;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 24px;
}

.large-item {
  height: 200px;
  background-repeat: round;
  position: relative;
  overflow: hidden;
}

.background-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: round;
  background-size: cover;
  /* background-position: center; */
  filter: blur(40px);
  /* background-repeat: round; */
  z-index: 1;
}

.content-overlay {
  position: relative;
  z-index: 2;
}

.small-item-1 {
  height: 92px; /* (200px - 16px gutter) / 2 */
}

.small-item-2-1,
.small-item-2-2 {
  height: 92px;
}
</style>

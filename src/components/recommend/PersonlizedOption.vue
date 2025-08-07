<template>
  <a-row :gutter="[16, 16]">
    <!-- 大块 -->
    <a-col :xs="24" :md="12">
      <div class="grid-item large-item">1</div>
    </a-col>
    <!-- 右侧/下方的小块容器 -->
    <a-col :xs="24" :md="12">
      <a-row :gutter="[16, 16]">
        <!-- 第一个小块 -->
        <a-col :span="24">
          <div class="grid-item small-item-1">2</div>
        </a-col>
        <!-- 第二个小块 (内部还有两个) -->
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
</script>

<style scoped>
.grid-item {
  background-color: #999;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 24px;
}

.large-item {
  height: 200px;
}

.small-item-1 {
  height: 92px; /* (200px - 16px gutter) / 2 */
}

.small-item-2-1,
.small-item-2-2 {
  height: 92px;
}
</style>

<template>
  <main class="container">
    <div class="block">
      <div class="title">
        <h3>
          Hi
          {{
            setting.userinfo.username === '未登录' || !setting?.userinfo?.username
              ? ''
              : ` ${setting.userinfo.username} `
          }}
          , 今日为你推荐
        </h3>
        <PersonlizedOption />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useSettingsStore } from '../constant/settings';
import PersonlizedOption from '../components/recommend/PersonlizedOption.vue';
const setting = useSettingsStore().settings;
</script>

<style scoped lang="css">
.title h3 {
  font-weight: 600;
  font-size: 21px;
  margin-bottom: 14px;
}
</style>

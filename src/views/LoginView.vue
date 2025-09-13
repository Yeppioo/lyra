<template>
  <a-flex class="login-container" justify="center" align="center">
    <a-flex :style="{ marginTop: '65px' }" vertical align="center">
      <img id="logo" src="/src/assets/img/logo.svg" alt="Logo" />
      <span id="title">登录 Lyra</span>
      <div class="login-component-container">
        <NeteaseLogin />
      </div>
    </a-flex>
  </a-flex>
</template>
<script setup lang="ts">
import NeteaseLogin from '@/components/login/netease/NeteaseLogin.vue';
</script>
<style scoped>
#logo {
  width: 80px;
  user-select: none;
  height: 80px;
  margin-bottom: 20px;
}
.login-container {
  width: 100%;
  align-items: start;
  margin-bottom: 20px;
}
#title {
  user-select: none;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 30px;
  margin-top: 5px;
  color: var(--y-text);
}
</style>

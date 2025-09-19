<template>
  <main class="netease-login-container">
    <component :is="selectedComponent" />
    <a v-show="false" @click="toggleMethod">使用 {{ methodTip }} 登录</a>
  </main>
</template>
<script setup lang="ts">
import { shallowRef, ref } from 'vue';
import PhoneLogin from './PhoneLogin.vue';
import EmailLogin from './EmailLogin.vue';
import CaptchaLogin from './CaptchaLogin.vue';
import QrCode from './QrCode.vue';

const selectedComponent = shallowRef(QrCode);
const methodTip = ref('验证码');

const toggleMethod = () => {
  if (selectedComponent.value === QrCode) {
    selectedComponent.value = CaptchaLogin;
    methodTip.value = '手机号';
  } else if (selectedComponent.value === CaptchaLogin) {
    selectedComponent.value = PhoneLogin;
    methodTip.value = '邮箱';
  } else if (selectedComponent.value === PhoneLogin) {
    selectedComponent.value = EmailLogin;
    methodTip.value = '扫码';
  } else if (selectedComponent.value === EmailLogin) {
    selectedComponent.value = QrCode;
    methodTip.value = '验证码';
  }
};
</script>
<style scoped>
.netease-login-container {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
a {
  margin-top: 10px;
  user-select: none;
}
.netease-login-container :deep(.ant-btn-primary) {
  background-color: #c1dbff;
}
[theme-dark] .netease-login-container :deep(.ant-btn-primary) {
  background-color: #1074ff;
}
.netease-login-container :deep(.ant-btn-primary:hover) {
  background-color: #d7e8ff;
}
[theme-dark] .netease-login-container :deep(.ant-btn-primary:hover) {
  background-color: #3187ff;
}
</style>

<template>
  <main class="container-netease-phone">
    <a-input
      class="a-input"
      :disabled="loging"
      type="number"
      name="phone"
      v-model:value="phone"
      placeholder="手机号" />
    <a-input-group compact>
      <a-input
        class="a-input"
        style="width: calc(100% - 100px); border-radius: 10px 0px 0px 10px"
        :disabled="loging"
        type="number"
        name="captcha"
        v-model:value="captcha"
        placeholder="验证码" />
      <a-button
        style="width: 100px; height: 38px; border-radius: 0px 10px 10px 0px"
        type="primary"
        @click="handleSendCaptcha"
        :disabled="loging || isCountingDown">
        {{ sendButtonText }}
      </a-button>
    </a-input-group>
    <a-button
      type="primary"
      @click="login"
      :loading="loging"
      style="width: 100%; border-radius: 10px; height: 38px">
      登录
    </a-button>
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { message } from 'ant-design-vue';
import { functions as neteaseLoginApi } from '@/api/netease/login';
import { useSettingsStore } from '@/constant/settings';

const phone = ref('');
const captcha = ref('');
const loging = ref(false);
const settingsStore = useSettingsStore();

const sendButtonText = ref('发送验证码');
const isCountingDown = ref(false);
let countDownTimer: number | undefined;

const handleSendCaptcha = async () => {
  if (!phone.value) return;
  isCountingDown.value = true;
  sendButtonText.value = '发送中';
  try {
    await neteaseLoginApi.sendCaptcha(phone.value);
    message.success('验证码发送成功');
    // Start countdown
    let seconds = 60;
    sendButtonText.value = `${seconds}s`;
    countDownTimer = window.setInterval(() => {
      seconds--;
      if (seconds <= 0) {
        window.clearInterval(countDownTimer);
        sendButtonText.value = '发送验证码';
        isCountingDown.value = false;
      } else {
        sendButtonText.value = `${seconds}s`;
      }
    }, 1000);
  } catch (error) {
    console.error('Failed to send captcha:', error);
    message.error('验证码发送失败');
    sendButtonText.value = '重新发送';
    isCountingDown.value = false;
  }
};

async function login() {
  if (!phone.value || !captcha.value) return;
  loging.value = true;
  try {
    const res = await neteaseLoginApi.loginByCellphone(phone.value, captcha.value);
    if (res.cookie) {
      settingsStore.settings.userinfo.netease.cookie = res.cookie;
      message.success('登录成功');
    } else {
      message.error('登录失败，请检查手机号或验证码');
    }
    // Handle login success, maybe emit an event or navigate
  } catch (error) {
    console.error('Login failed:', error);
    message.error('登录失败，请稍后重试');
    // Handle login failure
  } finally {
    loging.value = false;
  }
}
</script>
<style scoped>
.container-netease-phone {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 300px;
}

.password-container {
  position: relative;
  display: flex;
  align-items: center;
}

.a-input,
.a-input:-internal-autofill-selected,
.password-input,
.password-input:-internal-autofill-selected {
  border-radius: 10px;
  border: none;
  background-color: #f2f2f2 !important;
  padding: 8px 14px;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  font-size: 14px;
}
.password-input :deep(input) {
  background-color: #f2f2f2 !important;
}
[theme-dark] input,
[theme-dark] input:-internal-autofill-selected,
[theme-dark] .password-input :deep(input),
[theme-dark] .password-input,
[theme-dark] .password-input:-internal-autofill-selected {
  background-color: #3e3e41 !important;
}
.password-input::placeholder,
.a-input::placeholder {
  color: #aaa;
}

/* 隐藏数字输入框的上下箭头 */
.a-input[type='number']::-webkit-outer-spin-button,
.a-input[type='number']::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.a-input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}
</style>

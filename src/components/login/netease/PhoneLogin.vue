<template>
  <main class="container-netease-phone">
    <a-input-group :disabled="loging" compact>
      <a-input
        class="a-input"
        style="width: calc(100% - 85px); border-radius: 10px 0px 0px 10px"
        :disabled="loging"
        type="number"
        name="phone"
        v-model:value="phone"
        placeholder="手机号"
      />
      <a-button
        :disabled="loging"
        style="width: 85px; height: 38px; border-radius: 0px 10px 10px 0px"
        type="primary"
        @click="login"
        >{{ state }}</a-button
      >
    </a-input-group>

    <a-input-password
      type="password"
      :disabled="loging"
      class="password-input"
      name="password"
      v-model:value="password"
      placeholder="密码"
    />
  </main>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { functions as neteaseLoginApi } from '@/api/netease/login'
import { useSettingsStore } from '@/stores/settings'

const phone = ref('')
const password = ref('')
const state = ref('登录')
const loging = ref(false)
const settingsStore = useSettingsStore()

async function login() {
  if (!phone.value || password.value === '') return
  loging.value = true
  state.value = '登录中...'
  try {
    const res = await neteaseLoginApi.loginByCellphone(phone.value, undefined, password.value)
    if (res.cookie) {
      settingsStore.settings.userinfo.netease.cookie = res.cookie
      message.success('登录成功')
    } else {
      message.error('登录失败，请检查手机号或密码')
    }
  } catch (error) {
    console.error('Login failed:', error)
    message.error('登录失败，请稍后重试')
  } finally {
    loging.value = false
    state.value = '登录'
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

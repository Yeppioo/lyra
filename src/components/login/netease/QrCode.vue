<template>
  <main class="container-netease-qrcode">
    <a-spin :spinning="spinning" :indicator="indicator" :tip="spinningText">
      <a-image :width="200" :height="200" :src="qrImg" :preview="false">
        <template #fallback>
          <div class="state-container">
            <span>加载失败</span>
            <a-button @click="getQrCode" type="primary" size="mini">重试</a-button>
          </div>
        </template>
      </a-image>
    </a-spin>
    <p>{{ statusText }}</p>
  </main>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { functions as neteaseLoginApi } from '@/api/netease/login'
import { useSettingsStore } from '@/stores/settings'

import { LoadingOutlined } from '@ant-design/icons-vue';
import { h } from 'vue';
const indicator = h(LoadingOutlined, {
  style: {
    fontSize: '24px',
  },
  spin: true,
});

const qrImg = ref(' ') // Initial non-empty value to show loader
const statusText = ref('请使用网易云音乐APP扫码登录')
const settingsStore = useSettingsStore()
const spinning = ref(true)
const spinningText = ref('加载中...')

let qrKey = ''
let pollInterval: number | undefined

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = undefined
  }
}

const getQrCode = async () => {
  stopPolling()
  qrImg.value = ' ' // Show loader
  spinning.value = true
  spinningText.value = '加载中...'
  statusText.value = '正在生成二维码...'
  try {
    qrKey = await neteaseLoginApi.getQrCodeKey()
    qrImg.value = await neteaseLoginApi.createQrCodeImage(qrKey)
    statusText.value = '请使用网易云音乐APP扫码登录'
    spinning.value = false
    startPolling()
  } catch (error) {
    console.error('Failed to get QR code:', error)
    qrImg.value = '' // Trigger fallback
    statusText.value = '二维码获取失败, 刷新页面重试'
    message.error('二维码获取失败, 刷新页面重试')
    spinningText.value = '加载失败'
  }
}

const startPolling = () => {
  pollInterval = window.setInterval(async () => {
    try {
      const res = await neteaseLoginApi.checkQrCodeStatus(qrKey)
      switch (res.code) {
        case 800:
          statusText.value = '二维码已过期，请刷新'
          stopPolling()
          break
        case 801:
          statusText.value = '等待扫码'
          break
        case 802:
          statusText.value = '待确认'
          break
        case 803:
          statusText.value = '登录成功'
          stopPolling()
          if (res.cookie) {
            settingsStore.settings.userinfo.netease.cookie = res.cookie
            message.success('登录成功')
          }
          break
      }
    } catch (error) {
      console.error('Polling failed:', error)
      // Optional: handle polling errors, maybe stop polling
    }
  }, 3000) // Poll every 3 seconds
}

onMounted(() => {
  getQrCode()
})

onUnmounted(() => {
  stopPolling()
})
</script>
<style scoped>
.container-netease-qrcode {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.state-container {
  width: 200px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-fill-2);
  color: var(--color-text-2);
  border-radius: 4px;
  gap: 10px;
}
p {
  user-select: none;
}
</style>

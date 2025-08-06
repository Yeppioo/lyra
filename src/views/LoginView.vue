<template>
  <a-flex class="container" justify="center" align="center">
    <a-flex :style="{ marginTop: '65px' }" vertical align="center">
      <img id="logo" src="/src/assets/img/logo.svg" alt="Logo" />
      <span id="title">登录 Lyra</span>
      <a-menu
        v-model:selectedKeys="current"
        mode="horizontal"
        :items="items"
        class="provider-menu"
      />
      <div class="login-component-container">
        <component :is="selectedComponent" />
      </div>
    </a-flex>
  </a-flex>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import NeteaseLogin from '@/components/login/netease/NeteaseLogin.vue'
import TencentLogin from '@/components/login/tencent/TencentLogin.vue'
const providers = [
  {
    label: '网易云音乐',
    value: 'netease',
    component: NeteaseLogin,
  },
  {
    label: 'QQ音乐',
    value: 'tencent',
    component: TencentLogin,
  },
]

const current = ref<string[]>(['netease'])

const items = computed<MenuProps['items']>(() => {
  return providers.map((p) => ({
    key: p.value,
    label: p.label,
  }))
})

const selectedComponent = computed(() => {
  return providers.find((p) => p.value === current.value[0])?.component
})
</script>
<style scoped>
#logo {
  width: 80px;
  user-select: none;
  height: 80px;
  margin-bottom: 20px;
}
.container {
  width: 100%;
}
#title {
  user-select: none;
  font-size: 26px;
  font-weight: 700;
  margin-bottom: 30px;
  margin-top: 5px;
}
.login-component-container {
  margin-top: 20px;
}
.provider-menu {
  user-select: none;
  border-bottom: none;
  border-radius: var(--y-com-radius);
  background: var(--y-com-bg);
  height: 40px;
  line-height: 40px;
  padding: 0 4px;
  transition: all 0.3s;
}

.provider-menu :deep(.ant-menu-item) {
  border-radius: 4px;
  height: 32px;
  line-height: 32px;
  margin-top: 4px;
}
.container :deep(.ant-menu-item::after) {
  border-bottom-width: 0 !important;
}
.container :deep(.ant-menu-item) {
  margin-top: 3px;
  border-radius: calc(var(--y-com-radius) - 2px);
}
.provider-menu :deep(.ant-menu-item-selected) {
  background-color: var(--y-com-highlight-bg);
}

.provider-menu :deep(.ant-menu-item-selected::after) {
  border-bottom: none !important;
}
</style>

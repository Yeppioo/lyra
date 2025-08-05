<template>
  <div class="y-navbar" :class="{ 'y-navbar--scrolled': isScrolled }">
    <section class="content">
      <div class="left">
        <div class="y-navbar__logo">Z-Player</div>
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          @select="handleMenuSelect"
          :items="items"
        />
      </div>
      <div class="right"></div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { MenuProps } from 'ant-design-vue'
import { navConfig } from '../router/nav.config'
import { useRouter } from 'vue-router'

const router = useRouter()
const current = ref<string[]>(['/'])
const items = ref<MenuProps['items']>(navConfig)
const isScrolled = ref(false)

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}
const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(key as string)
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between; /* 使左右两边对齐 */
  align-items: center; /* 垂直居中 */
  height: 54px;
}
.left {
  display: flex;
  align-items: center; /* 垂直居中 logo 和菜单 */
}
.y-navbar {
  align-items: center;
  background: var(--y-nav-bg);
  box-shadow: none;
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  height: 54px;
  padding: 0 32px;
  width: 100%;
  transition:
    top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    right 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    border-radius 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.y-navbar--scrolled {
  position: fixed;
  top: 15px;
  left: 15px;
  right: 15px;
  width: auto;
  border-radius: 12px;
}
.y-navbar__logo {
  display: flex;
  align-items: center;
  font-size: 18px;
  margin-right: 20px;
}

/* 确保菜单不换行，并在溢出时隐藏 */
.ant-menu-horizontal {
  overflow: hidden;
  white-space: nowrap;
}
</style>

<template>
  <div class="y-navbar" :class="{ 'y-navbar--scrolled': isScrolled }">
    <div class="y-navbar__logo">Z-Player</div>
    <a-menu
      mode="horizontal"
      :selectedKeys="[selectedKey]"
      @click="onMenuClick"
      class="y-navbar__menu"
    >
      <a-menu-item v-for="item in navConfig" :key="item.path">
        <i :class="item.icon" style="margin-right: 8px"></i>
        {{ item.name }}
      </a-menu-item>
    </a-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { navConfig } from '../router/nav.config'

const router = useRouter()
const route = useRoute()
const selectedKey = ref(route.path)

const isScrolled = ref(false)

const onMenuClick = (e: any) => {
  router.push(e.key)
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.y-navbar {
  display: flex;
  align-items: center;
  background: var(--y-nav-bg);
  border-radius: var(--y-nav-radius);
  box-shadow: none;
  transition: box-shadow 0.2s;
  position: sticky;
  top: 0;
  z-index: 100;
  height: 56px;
  padding: 0 32px;
}
.y-navbar--scrolled {
  box-shadow: var(--y-nav-shadow);
}
.y-navbar__logo {
  font-weight: bold;
  font-size: 20px;
  margin-right: 32px;
}
.y-navbar__menu {
  flex: 1;
}
</style>

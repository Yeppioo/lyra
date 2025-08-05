<template>
  <div class="y-navbar" :class="{ 'y-navbar--scrolled': isScrolled }">
    <section class="content">
      <div class="y-navbar__logo">Z-Player</div>
      <a-menu
        mode="horizontal"
        :selectedKeys="[selectedKey]"
        @click="onMenuClick"
        class="y-navbar__menu"
      >
        <a-menu-item class="y-navbar__menu-item" v-for="item in navConfig" :key="item.path">
          <router-link :to="item.path">
            <i :class="item.icon" />
            {{ item.name }}
          </router-link>
        </a-menu-item>
      </a-menu>
    </section>
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
.content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  height: 54px;
  flex-wrap: wrap;
  align-content: center;
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
  margin-right: 32px;
  margin-top: -4px;
}
.y-navbar__menu {
  flex: 1;
}
.y-navbar__menu-item { 
  user-select: none;
  margin-right: 20px;
}
</style>

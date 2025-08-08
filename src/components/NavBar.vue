<template>
  <div
    class="y-navbar"
    :class="{ 'y-navbar--scrolled': isScrolled, 'search-expanded': isSearchExpanded }">
    <section class="content">
      <div class="left">
        <div @click="goHome" class="y-navbar__logo">
          <img src="../assets/img/logo.svg" alt="Lyra Logo" class="logo-img" />
        </div>
        <div class="nav-buttons">
          <a-button type="text" @click="goBack">
            <font-awesome-icon :icon="['fas', 'angle-left']" />
          </a-button>
          <a-button type="text" @click="goForward">
            <font-awesome-icon :icon="['fas', 'angle-right']" />
          </a-button>
        </div>
      </div>
      <a-menu
        v-model:selectedKeys="current"
        mode="horizontal"
        @select="handleMenuSelect"
        :items="items"
        class="center-menu"
        :class="{ 'hidden-on-search': isSearchExpanded }" />
      <div class="right">
        <div class="buttons" :class="{ 'expanded-serch-container': isSearchExpanded }">
          <div class="search-container">
            <a-button
              style="margin-right: 6px"
              v-if="showSearchIcon && !isSearchExpanded"
              @click="expandSearch"
              type="text"
              class="nav-button">
              <font-awesome-icon :icon="['fas', 'search']" />
            </a-button>
            <div
              :class="{ 'hidden-on-search': !isSearchExpanded && showSearchIcon }"
              class="search-control">
              <SearcherBox
                ref="searchInput"
                class="expanded-serch-container"
                @blur="collapseSearch" />
            </div>
          </div>
          <a-button
            class="nav-button"
            @click="toggleTheme"
            type="text"
            :class="{ 'hidden-on-search': isSearchExpanded }">
            <font-awesome-icon
              :icon="['fas', 'sun']"
              v-if="settingsStore.settings.theme === 'light'" />
            <font-awesome-icon
              :icon="['fas', 'moon']"
              v-if="settingsStore.settings.theme === 'dark'" />
          </a-button>
          <a-dropdown class="nav-button-root" :class="{ 'hidden-on-search': isSearchExpanded }">
            <a-button @click.prevent class="nav-button" type="text">
              <font-awesome-icon :icon="['fas', 'caret-down']" />
            </a-button>
            <template #overlay>
              <a-menu v-model:selectedKeys="current" mode="vertical" @select="handleMenuSelect">
                <template v-for="item in items" :key="item?.key as string">
                  <a-menu-item
                    v-if="
                      item && 'key' in item && 'label' in item && (item as any).type !== 'divider'
                    "
                    :key="item.key as string"
                    @click="handleMenuSelect({ key: item.key as string })">
                    <component :is="(item as any).icon" v-if="(item as any).icon" />
                    {{ item.label }}
                  </a-menu-item>
                </template>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <a-dropdown :class="{ 'hidden-on-search': isSearchExpanded }">
          <a-avatar :src="settingsStore.settings.userinfo.avatar" class="avatar" :size="32">
            <template #icon>
              <font-awesome-icon transform="up-1" :icon="['fas', 'user']" />
            </template>
          </a-avatar>
          <template #overlay>
            <a-menu>
              <div style="display: flex">
                <a-avatar
                  style="margin: 10px"
                  :src="settingsStore.settings.userinfo.avatar"
                  class="avatar"
                  :size="38">
                  <template #icon>
                    <font-awesome-icon transform="up-1" :icon="['fas', 'user']" />
                  </template>
                </a-avatar>
                <div
                  style="
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    margin-right: 20px;
                  ">
                  <span style="font-size: 14px; margin-bottom: -3px; color: var(--y-text)">
                    {{ settingsStore.settings.userinfo.username }}
                  </span>
                  <span style="font-size: 12px; color: var(--y-color-gray)">
                    {{ settingsStore.settings.userinfo.usernameLabel }}
                  </span>
                </div>
              </div>
              <a-divider style="margin: 4px 0" />
              <a-menu-item
                style="padding: 7px 12px"
                @click="handleMenuSelect({ key: '/auth/login' })">
                <font-awesome-icon style="margin-right: 7px" :icon="['fas', 'key']" />
                登录账户
              </a-menu-item>
              <a-menu-item style="padding: 7px 12px" @click="handleMenuSelect({ key: 'settings' })">
                <font-awesome-icon style="margin-right: 7px" :icon="['fas', 'gear']" />
                全局设置
              </a-menu-item>
              <a-menu-item style="padding: 7px 12px" @click="handleMenuSelect({ key: 'about' })">
                <font-awesome-icon style="margin-right: 7px" :icon="['fas', 'circle-info']" />
                关于本站
              </a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { MenuProps } from 'ant-design-vue';
import { navConfig } from '../router/nav.config';
import { useRouter } from 'vue-router';
import { useSettingsStore } from '../constant/settings';
import SearcherBox from './SearcherBox.vue';

const router = useRouter();
const settingsStore = useSettingsStore();
const current = ref<string[]>(['/']);
const items = ref<MenuProps['items']>(navConfig);
const isScrolled = ref(false);
const searchInput = ref<InstanceType<typeof SearcherBox> | null>(null);

const isSearchExpanded = ref(false);
const showSearchIcon = ref(window.innerWidth < 590);

const handleMenuSelect = ({ key }: { key: string }) => {
  router.push(key as string);
  current.value = [key];
};

const expandSearch = async () => {
  isSearchExpanded.value = true;
  await nextTick();
  searchInput.value?.focusInput();
};

const collapseSearch = () => {
  isSearchExpanded.value = false;
};

const handleResize = () => {
  showSearchIcon.value = window.innerWidth < 590;
  if (window.innerWidth >= 590) {
    isSearchExpanded.value = false;
  }
};

const toggleTheme = () => {
  const themes = ['light', 'dark'];
  const currentIndex = themes.indexOf(settingsStore.settings.theme);
  const nextIndex = (currentIndex + 1) % themes.length;
  settingsStore.settings.theme = themes[nextIndex] as 'light' | 'dark';
};

const handleScroll = () => {
  isScrolled.value = window.scrollY > 0;
};

const goBack = () => {
  router.back();
};

const goHome = () => {
  router.push('/');
};
const goForward = () => {
  router.forward();
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  window.addEventListener('resize', handleResize);
  current.value = [router.currentRoute.value.path];
});

watch(
  () => router.currentRoute.value.path,
  (newPath) => {
    current.value = [newPath]; // 监听路由变化并更新选中项
  },
  { immediate: true } // 立即执行一次，确保初始状态正确
);

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.search-control {
  display: flex;
  align-items: center;
}
.expanded-serch-container {
  margin-right: -20px !important;
  width: 100%;
  margin-left: 25px;
}
.y-navbar.search-expanded .content {
  grid-template-columns: auto 1fr; /* Logo auto, search box 1fr */
}

.y-navbar.search-expanded .right {
  width: 100%;
  justify-content: flex-start;
}

.y-navbar.search-expanded .search-container {
  flex-grow: 1;
}

.y-navbar.search-expanded .search-container .ant-select {
  width: 100% !important;
}

@media (min-width: 590px) {
  .search-container {
    width: 270px;
  }
}

.hidden-on-search {
  display: none !important;
}
.y-navbar.search-expanded .left .nav-buttons {
  display: none;
}
.y-navbar__logo {
  cursor: pointer;
}
@media (min-width: 640px) {
  .y-navbar__logo:hover {
    transform: scale(1.15);
  }
}
.avatar {
  background: rgba(0, 0, 0, 0.06);
}
[theme-dark] .avatar {
  background: rgba(255, 255, 255, 0.12);
}
.ant-menu-root {
  background: transparent;
}
.content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid; /* 使用 grid 布局 */
  grid-template-columns: auto 1fr auto; /* 左侧、中间自适应、右侧 */
  align-items: center; /* 垂直居中 */
  height: 54px;
  transition: grid-template-columns 0.3s ease;
}
.left,
.right {
  display: flex;
  align-items: center; /* 垂直居中 logo */
}
.nav-button {
  padding: 0 7px;
  margin-right: 2px;
}
.nav-buttons {
  display: flex;
  align-items: center;
  margin-left: 10px; /* 按钮与 logo 之间的间距 */
}
.nav-button-root {
  display: none;
}
.buttons {
  display: flex;
  align-items: center;
  margin-right: 10px;
}
.nav-buttons .ant-btn {
  font-size: 18px; /* 调整按钮图标大小 */
  padding: 0 8px; /* 调整按钮内边距 */
}
.center-menu {
  justify-self: center; /* 菜单在中间列中水平居中 */
  width: 100%; /* 确保菜单占据中间列的全部宽度 */
}
.right {
  justify-self: end; /* 右侧头像靠右对齐 */
}
.y-navbar {
  position: fixed;

  user-select: none;
  align-items: center;
  background: var(--y-nav-bg);
  box-shadow: none;
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
    background 0.3s;
}
.y-navbar :deep(.ant-btn-default) {
  background: transparent;
  border: 0;
  box-shadow: unset;
}
.y-navbar :deep(.ant-input-group-addon) {
  background: transparent;
  border: 0;
  box-shadow: unset;
}

/* .y-navbar--scrolled {
  top: 15px;
  margin: 0 15px;
  width: auto;
  border-radius: 12px;
} */
.y-navbar__logo {
  display: flex;
  align-items: center;
  font-size: 18px;
}
.logo-img {
  height: 32px; /* 调整 logo 大小 */
  width: auto;
}

/* 确保菜单可以完全展开并居中 */
.ant-menu-horizontal {
  /* 移除可能限制菜单展开的样式 */
  /* overflow: hidden; */
  /* white-space: nowrap; */
  justify-content: center; /* 尝试让菜单项居中 */
}

/* 隐藏 Ant Design Vue 菜单选中项下方的蓝色边框 */
.y-navbar :deep(.ant-menu-item::after) {
  border-bottom-width: 0 !important;
}

.ant-menu {
  border: 0;
}

/* 设置选中菜单项的底色块高度并居中 */
.y-navbar :deep(.ant-menu-item) {
  height: 38px !important;
  user-select: none;
  line-height: 38px !important; /* 确保文本垂直居中 */
  display: flex !important; /* 使用 flex 布局 */
  align-items: center !important; /* 垂直居中 */
  justify-content: center !important; /* 水平居中 */
  border-radius: var(--y-com-radius); /* 添加圆角，使色块更美观 */
  box-sizing: border-box; /* 确保 padding 不会增加高度 */
}

.y-navbar :deep(.ant-menu-item:hover) {
  background-color: rgba(0, 0, 0, 0.06) !important;
}
[theme-dark] .y-navbar :deep(.ant-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.12) !important;
}
.y-navbar :deep(.ant-menu-item-selected:hover),
.y-navbar :deep(.ant-menu-item-selected) {
  background-color: #d2e5fe !important;
}
[theme-dark] .y-navbar :deep(.ant-menu-item-selected:hover),
[theme-dark] .y-navbar :deep(.ant-menu-item-selected) {
  background-color: #232d3e !important;
}
.y-navbar :deep(.ant-menu-item-selected > span),
.y-navbar :deep(.ant-menu-item-selected > svg > path) {
  color: #1677ff !important; /* 用户指定的文本颜色 */
}
[theme-dark] .y-navbar :deep(.ant-menu-item-selected > span),
[theme-dark] .y-navbar :deep(.ant-menu-item-selected > svg > path) {
  color: #81bbfd !important; /* 用户指定的文本颜色 */
}
[theme-dark] .y-navbar :deep(.ant-menu-item-selected > svg) {
  fill: #81bbfd !important; /* 用户指定的文本颜色 */
}
@media (max-width: 768px) {
  .center-menu {
    display: none;
  }
  .nav-button-root {
    display: unset;
  }
}
</style>

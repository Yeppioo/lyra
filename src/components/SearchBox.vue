<template>
  <div class="search-container">
    <a-button
      style="margin-right: 6px; padding: 0 7px"
      v-if="showSearchIcon && !isSearchExpanded"
      @click="expandSearch"
      type="text"
      class="nav-button"
    >
      <font-awesome-icon :icon="['fas', 'search']" />
    </a-button>
    <a-input-search
      placeholder="搜索..."
      class="search-box"
      style="width: calc(100% - 20px)"
      v-if="!showSearchIcon"
      ref="searchInput"
      :bordered="false"
      @blur="collapseSearch"
    >
    </a-input-search>
  </div>

  <a-modal
    :open="showSearchIcon && isSearchExpanded"
    :footer="null"
    :closable="true"
    @cancel="collapseSearch"
    wrapClassName="full-screen-modal"
    ><span style="font-size: 17px; margin-top: -5px">搜索</span>
    <a-input-search
      placeholder="搜索..."
      class="search-box"
      style="width: 100%; margin: 0; margin-top: 10px"
      ref="searchInputModal"
      :bordered="false"
    >
    </a-input-search>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const isSearchExpanded = ref(false)
const showSearchIcon = ref(window.innerWidth < 530)
const searchInput = ref<HTMLInputElement | null>(null)
const searchInputModal = ref<HTMLInputElement | null>(null)

const expandSearch = async () => {
  isSearchExpanded.value = true
  await nextTick()
  if (showSearchIcon.value) {
    searchInputModal.value?.focus()
  } else {
    searchInput.value?.focus()
  }
}

const collapseSearch = () => {
  isSearchExpanded.value = false
}

const handleResize = () => {
  showSearchIcon.value = window.innerWidth < 530
  if (window.innerWidth >= 530) {
    isSearchExpanded.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

defineExpose({
  isSearchExpanded,
  collapseSearch,
  searchInput,
  searchInputModal,
})
</script>

<style>
.full-screen-modal > div {
  width: 100vw;
  overflow: hidden;
  top: 54px !important;
  border-radius: var(--y-com-radius);
  margin: 16px;
  height: calc(100vh - 86px);
}
.full-screen-modal {
  top: 0;
  left: 0;
  padding: 0;
  margin: 0;
  overflow: hidden !important;
  width: 100vw;
}
.nav-button {
  padding: 0 7px;
  margin-right: 2px;
}

.full-screen-modal .ant-modal-content {
  height: 100vh;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  background-color: var(--y-bg);
}

.full-screen-modal .ant-modal-body {
  flex-grow: 1;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-direction: column;
}
</style>

<style scoped>
.search-container {
  display: flex;
  align-items: center;
}
.expanded-serch-container {
  margin-right: -20px;
  width: 100%;
  margin-left: 25px;
}

.hidden-on-search {
  display: none !important;
}

.search-box {
  margin-right: 10px;
  margin-top: 1px;
  border-radius: var(--y-com-radius);
  background: var(--y-com-highlight-bg);
}

.search-box :deep(.ant-input-group-addon) {
  background: transparent;
}
.search-box :deep(.ant-btn-default) {
  background: transparent;
  border: 0;
}
.search-box :deep(input) {
  border: 0;
}
</style>

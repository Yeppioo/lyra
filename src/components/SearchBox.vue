<template>
  <div class="search-container">
    <a-button
      style="margin-right: 6px"
      v-if="showSearchIcon && !isSearchExpanded"
      @click="expandSearch"
      type="text"
      class="nav-button"
    >
      <font-awesome-icon :icon="['fas', 'search']" />
    </a-button>
    <a-input-search
      placeholder="搜索..."
      class="search-box" style="width: calc(100% - 20px);"
      v-if="!showSearchIcon || isSearchExpanded"
      ref="searchInput"
      :bordered="false"
      @blur="collapseSearch"
    >
    </a-input-search>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'

const isSearchExpanded = ref(false)
const showSearchIcon = ref(window.innerWidth < 530)

const expandSearch = async () => {
  isSearchExpanded.value = true
  await nextTick()
}

const collapseSearch = () => {
  isSearchExpanded.value = false
}

const handleResize = () => {
  showSearchIcon.value = window.innerWidth < 530
  if (window.innerWidth >= 530) {
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
})
</script>

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
</style>

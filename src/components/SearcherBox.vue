<template>
  <a-popover placement="bottomLeft" trigger="focus">
    <a-input-search
      placeholder="搜索..."
      class="search-box"
      ref="searchInput"
      v-model:value="searchValue"
      :bordered="false"
      @change="onChange"
      @search="onSearch">
    </a-input-search
    ><template #content>
      <main class="search-tip-container">
        <div v-if="settingsStore.settings.searchHistory.length > 0" class="title">
          <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
          <span>搜索历史</span>
        </div>
        <div v-for="(value, index) in SearchTipGroups" :key="index">
          <div class="title">
            <component :is="(value as SearchTipGroup).icon" v-if="(value as SearchTipGroup).icon" />
            <span>{{ (value as SearchTipGroup).name }}</span>
          </div>
          <a-menu>
            <a-menu-item
              @click="handleMenuSelect({ key: item.key })"
              v-for="(item, index) in (value as SearchTipGroup).items"
              :key="index">
              <span>{{ item.key }}</span>
            </a-menu-item>
          </a-menu>
        </div>
      </main>
    </template></a-popover
  >
</template>
<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { onMounted, ref, type VNode } from 'vue';
import { functions as neteaseLoginApi } from '@/api/netease/hot';
import type { Input } from 'ant-design-vue';
import debounce from '@/utils/debounce';

const settingsStore = useSettingsStore();
const searchValue = ref('');
const SearchTipGroups = ref<SearchTipGroup[]>([]);
const searchInput = ref<InstanceType<typeof Input> | null>(null);

const handleSearchKey = () => {
  console.log('change to:', searchValue.value);
};

const debouncedOnTextChange = debounce(handleSearchKey, 200);

const handleMenuSelect = ({ key }: { key: string }) => {
  console.log(1121);

  handleSearch(key);
};

const handleSearch = (word: string) => {
  console.log('searchText:', word);

  if (!word || word.trim() === '') return;
  const key = word.trim();
  if (!settingsStore.settings.searchHistory.includes(key))
    settingsStore.settings.searchHistory.push(key);
};
const onSearch = (searchText: string) => {
  handleSearch(searchText);
};

const onChange = () => {
  debouncedOnTextChange();
};

interface SearchTipGroup {
  name: string;
  items: SearchTipEntry[];
  icon: VNode;
}

interface SearchTipEntry {
  key: string;
  iconType: number;
  rank?: number;
}

export type { SearchTipGroup, SearchTipEntry };

interface Focusable {
  focus: () => void;
}

let hotSearch: SearchTipGroup[] = [];

onMounted(() => {
  asyncInit();
});

function focusInput() {
  (searchInput.value as unknown as Focusable)?.focus();
}

const asyncInit = async () => {
  hotSearch = await neteaseLoginApi.getHotKeyword();
  SearchTipGroups.value = hotSearch;
};

defineExpose({
  focusInput,
});
</script>

<style lang="css" scoped>
.search-box {
  margin-right: 10px;
  margin-top: 1px;
  border-radius: var(--y-com-radius);
  background: var(--y-com-highlight-bg);
}
.title * {
  color: #f55e55 !important;
}
.title span {
  margin-left: 10px;
  font-size: 15px;
}
.search-tip-container {
  max-height: 510px;
  overflow: scroll;
  min-width: 230px;
}
.search-tip-container > div > .ant-menu-root {
  border: 0;
  background: transparent;
}
</style>

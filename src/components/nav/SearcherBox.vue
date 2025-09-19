<template>
  <a-popover placement="bottomLeft" trigger="focus">
    <a-input-search
      autocomplete="off"
      :placeholder="uiProperties.defaultSearchKey.show"
      class="search-box"
      ref="searchInput"
      v-model:value="searchValue"
      :bordered="false"
      @focus="onFocus"
      @change="onChange"
      @search="onSearch">
    </a-input-search
    ><template #content>
      <main class="search-tip-container">
        <div :class="{ hidden: settingsStore.settings.searchHistory.length === 0 }">
          <div class="title">
            <font-awesome-icon size="lg" :icon="['fas', 'clock-rotate-left']" />
            <span>搜索历史</span>
            <a-button @click="openModal" class="clear-history" type="link">
              <font-awesome-icon :icon="['fas', 'trash']" /><span>删除历史记录</span></a-button
            >
            <a-modal
              v-model:open="open"
              :title="
                h('div', { class: 'clear-history-title-modal' }, [
                  h(FontAwesomeIcon, {
                    icon: ['fas', 'circle-info'],
                    size: 'lg',
                  }),
                  h('span', '确认删除'),
                ])
              "
              @ok="handleClear">
              <template #footer>
                <a-button @click="open = false" class="cancel-button">取消</a-button>
                <a-button
                  @click="
                    settingsStore.settings.searchHistory = [];
                    message.success('已清空');
                    open = false;
                  "
                  class="highlight-button"
                  >删除</a-button
                >
              </template>
              <p>确认删除所有搜索历史记录?</p>
            </a-modal>
          </div>
          <a-flex class="history-container" wrap="wrap" gap="small">
            <a-button
              @click="handleMenuSelect({ key: item, type: 'string' })"
              class="history-item"
              v-for="item in settingsStore.settings.searchHistory"
              :key="item"
              shape="round"
              size="small"
              >{{ item }}</a-button
            >
          </a-flex>
        </div>
        <div v-for="(value, index) in SearchTipGroups" :key="index">
          <div class="title">
            <component :is="(value as SearchTipGroup).icon" v-if="(value as SearchTipGroup).icon" />
            <span>{{ (value as SearchTipGroup).name }}</span>
          </div>
          <a-menu class="search-tip-menu">
            <a-menu-item
              v-model:selectedKeys="current"
              @click="handleMenuSelect(item)"
              v-for="(item, index) in (value as SearchTipGroup).items"
              :key="index">
              <span
                v-if="item.rank"
                class="rank"
                :class="{ 'top-3': (item.rank as number) <= 3 }"
                >{{ item.rank }}</span
              >
              <span class="text">{{ item.key }}</span>
              <span class="up-icon" v-if="(item.iconType as number) > 0">UP</span>
            </a-menu-item>
          </a-menu>
        </div>
      </main>
    </template></a-popover
  >
</template>
<script setup lang="ts">
import { useSettingsStore } from '../../stores/settings';
import { onMounted, ref, h } from 'vue';
import { functions as neteaseSearchApi } from '@/api/netease/search';
import { type Input } from 'ant-design-vue';
import debounce from '@/utils/debounce';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { message } from 'ant-design-vue';
import { useUIPropertiesStore } from '../../stores/uiProperties';
import { storeToRefs } from 'pinia';
import type { SearchTipGroup, SearchTipEntry } from '../../types/uiProperties';
import { useRouter } from 'vue-router'; // 引入 useRouter

const router = useRouter(); // 获取 router 实例
const current = ref<SearchTipEntry[] | null>(null);
const settingsStore = useSettingsStore();
const searchValue = ref('');
const open = ref(false);
const SearchTipGroups = ref<SearchTipGroup[]>([]);
const searchInput = ref<InstanceType<typeof Input> | null>(null);
let abortController: AbortController | null = null;

const uiPropertiesStore = useUIPropertiesStore();
const { uiProperties } = storeToRefs(uiPropertiesStore);

const onFocus = () => {
  if (!searchValue.value || searchValue.value.length === 0)
    SearchTipGroups.value = uiProperties.value.hotSearchTips;
};

const handleSearchKey = async () => {
  const key = searchValue.value;
  if (!key || key.length === 0) {
    SearchTipGroups.value = uiProperties.value.hotSearchTips;
  } else {
    // 取消之前的请求
    SearchTipGroups.value = [];
    if (abortController) {
      abortController.abort();
    }

    // 创建新的AbortController
    abortController = new AbortController();

    try {
      const result = await neteaseSearchApi.getSuggestKeyword(key, abortController.signal);
      // 检查请求是否被取消
      if (!abortController.signal.aborted) {
        SearchTipGroups.value = result;
      }
    } catch (error) {
      // 忽略取消请求的错误
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Search suggest error:', error);
      }
    }
  }
};
const openModal = () => {
  open.value = true;
};

const debouncedOnTextChange = debounce(handleSearchKey, 200);

const handleMenuSelect = (key: SearchTipEntry) => {
  current.value = null;
  searchValue.value = key.key;
  handleSearch(key);
};
const handleClear = () => {
  settingsStore.settings.searchHistory = [];
};
const handleSearch = (key: SearchTipEntry) => {
  const word = key.key.trim();
  if (!word || word === '') return;

  const index = settingsStore.settings.searchHistory.indexOf(word);
  if (index !== -1) {
    settingsStore.settings.searchHistory.splice(index, 1);
  }

  // 将新记录添加到数组开头
  settingsStore.settings.searchHistory.unshift(word);

  // 如果记录超过15个，移除最后一个
  if (settingsStore.settings.searchHistory.length > 15) {
    settingsStore.settings.searchHistory.pop();
  }

  if (key.type === 'hot') {
    searchValue.value = key.key;
    debouncedOnTextChange();
    //TODO 搜索热词
  }
  // 导航到搜索结果页
  router.push(`/search/songs/${encodeURIComponent(word)}`);
};

const onSearch = (searchText: string) => {
  handleSearch({
    key: searchText,
    type: 'string',
    obj: null,
    iconType: 0,
  });
};

const onChange = () => {
  if (!searchValue.value || searchValue.value.length === 0) {
    SearchTipGroups.value = uiProperties.value.hotSearchTips;
    return;
  }
  debouncedOnTextChange();
};

interface Focusable {
  focus: () => void;
}

onMounted(() => {
  SearchTipGroups.value = uiProperties.value.hotSearchTips;
});

function focusInput() {
  (searchInput.value as unknown as Focusable)?.focus();
}

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
  max-height: min(561px,calc(100vh - 200px));
  overflow: scroll;
  min-width: 230px;
  max-width: 360px;
}
.search-tip-container > div > .ant-menu-root {
  border: 0;
  background: transparent;
}
.ant-popover-arrow {
  display: none !important;
}
.history-container {
  margin: 15px;
  margin-bottom: 20px;
  max-height: 100px;
  overflow-y: scroll;
  overflow-x: hidden;
}
.search-tip-menu {
  margin-top: 7px;
  margin-bottom: 7px;
}
.history-item {
  border: 0;
  background: var(--y-com-highlight-bg);
  height: auto;
  box-shadow: none;
  display: flex;
}

.history-item :deep(span) {
  max-width: 288px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 3px;
  margin-bottom: 2px;
  font-size: 13px;
  color: var(--y-text);
}

.history-item:hover :deep(span) {
  color: #1677ff;
}
.history-item:hover {
  background: #e6f4ff;
}
[theme-dark] .history-item:hover {
  background: #021d3d;
}
.clear-history {
  margin-left: 5px;
}
.clear-history span {
  color: grey !important;
  margin-left: 3px !important;
  font-size: 14px;
}
.clear-history :deep(path) {
  color: grey !important;
}
.clear-history-title-modal .fa-circle-info {
  margin-right: 10px;
  color: #f0a020;
}
[theme-dark] .clear-history-title-modal .fa-circle-info {
  color: #f2c97d;
}
.highlight-button {
  background: #f0a020;
}
[theme-dark] .highlight-button {
  background: #f2c97d;
}
.highlight-button {
  border: 0;
  box-shadow: none;
  color: #1f1f1f;
}
.highlight-button:hover {
  background: #f5d599;
  color: #1f1f1f;
}
.cancel-button {
  background: transparent;
  color: var(--y-text);
  box-shadow: none;
}
.hidden {
  display: none !important;
}
.rank {
  font-size: 16px;
  margin-right: 8px;
  font-weight: 600;
}
.text {
  font-size: 16px;
  font-weight: 600;
}
.top-3 {
  color: #f55e55 !important;
}
.up-icon {
  background: #f55e551f;
  border-radius: 100px;
  font-size: 12px;
  padding: 0 7px;
  padding-bottom: 1px;
  margin-left: 12px;
  position: relative;
  top: -1px;
  color: #f55e55;
}
</style>

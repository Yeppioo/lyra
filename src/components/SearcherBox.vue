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
              @click="handleMenuSelect({ key: item.key })"
              v-for="(item, index) in (value as SearchTipGroup).items"
              :key="index">
              <span
                v-if="item.rank"
                class="rank"
                :class="{ 'top-3': (item.rank as number) <= 3 }"
                >{{ item.rank }}</span
              >
              <span class="text">{{ item.key }}</span>
              <span class="up-icon" v-if="item.iconType > 0">UP</span>
            </a-menu-item>
          </a-menu>
        </div>
      </main>
    </template></a-popover
  >
</template>
<script setup lang="ts">
import { useSettingsStore } from '../stores/settings';
import { onMounted, ref, type VNode, h } from 'vue';
import { functions as neteaseLoginApi } from '@/api/netease/search';
import { type Input } from 'ant-design-vue';
import debounce from '@/utils/debounce';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { message } from 'ant-design-vue';

const current = ref<SearchTipEntry[] | null>(null);
const settingsStore = useSettingsStore();
const searchValue = ref('');
const open = ref(false);
const SearchTipGroups = ref<SearchTipGroup[]>([]);
const searchInput = ref<InstanceType<typeof Input> | null>(null);

const handleSearchKey = () => {
  console.log('change to:', searchValue.value);
};
const openModal = () => {
  open.value = true;
};

const debouncedOnTextChange = debounce(handleSearchKey, 200);

const handleMenuSelect = ({ key }: { key: string }) => {
  current.value = null;
  handleSearch(key);
};
const handleClear = () => {
  settingsStore.settings.searchHistory = [];
};
const handleSearch = (word: string) => {
  console.log('searchText:', word);

  if (!word || word.trim() === '') return;
  const key = word.trim();

  // 先移除相同的记录（如果存在）
  const index = settingsStore.settings.searchHistory.indexOf(key);
  if (index !== -1) {
    settingsStore.settings.searchHistory.splice(index, 1);
  }

  // 将新记录添加到数组开头
  settingsStore.settings.searchHistory.unshift(key);

  // 如果记录超过15个，移除最后一个
  if (settingsStore.settings.searchHistory.length > 15) {
    settingsStore.settings.searchHistory.pop();
  }
};

const onSearch = (searchText: string) => {
  handleSearch(searchText);
};

const onChange = () => {
  debouncedOnTextChange();
};

interface DefaultSearchTip {
  key: string;
  show: string;
}

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
  console.log(hotSearch);
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
  max-width: 360px;
}
.search-tip-container > div > .ant-menu-root {
  border: 0;
  background: transparent;
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

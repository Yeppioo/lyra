<template>
  <a-input-search
    placeholder="搜索..."
    class="search-box"
    ref="searchInput"
    v-model:value="searchValue"
    :options="searchOptions"
    :bordered="false"
    :filter-option="filterOption"
    :render-option="renderSearchOption"
    @select="onSelect"
    @search="onSearch">
  </a-input-search>
</template>
<script setup lang="ts">
import { h, onMounted, ref } from 'vue';
import type { VNode } from 'vue';
import {  functions as neteaseLoginApi } from '@/api/netease/hot';
import type { Input } from 'ant-design-vue';

const hotSearch: Option[] = [];
const searchValue = ref('');
const searchOptions = ref<Option[]>([]);
const searchInput = ref<InstanceType<typeof Input> | null>(null);
const filterOption = (input: string, option: Option) => {
  return option.word.toUpperCase().indexOf(input.toUpperCase()) >= 0;
};
const renderSearchOption = (option: Option) => {
  return option.label;
};

const focusInput = () => {
  (searchInput.value as unknown as Focusable)?.focus();
};

const onSearch = (searchText: string) => {
  searchOptions.value = !searchText
    ? hotSearch
    : hotSearch.filter((option) => option.word.toUpperCase().includes(searchText.toUpperCase()));
};
interface Option {
  word: string;
  label?: VNode;
  rank?: number;
  iconType?: number;
}
interface Focusable {
  focus: () => void;
}

const onSelect = (value: string) => {
  searchValue.value = value;
  (searchInput.value as unknown as Focusable)?.focus();
};

onMounted(() => {
  asyncInit();
});

const asyncInit = async () => {
  const list = await neteaseLoginApi.getHotKeyword();

  list.forEach((item, index) => {
    const rank = index + 1;
    const isTop3 = rank <= 3;
    const showIcon = item.iconType !== 0;

    hotSearch.push({
      word: item.searchWord,
      label: h('div', { class: 'hot-search-item' }, [
        h(
          'span',
          {
            class: ['rank-number', { 'rank-top3': isTop3 }],
            style: {
              color: isTop3 ? '#F55E55' : '',
            },
          },
          rank
        ),
        h('span', item.searchWord),
        showIcon ? h('span', { class: 'icon-badge' }, 'Up') : null,
      ]),
      rank: rank,
      iconType: item.iconType,
    });
  });
  searchOptions.value = hotSearch;
};

export  = {
  focusInput,
};
</script>

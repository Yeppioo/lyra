<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="songs-search-result">
    <a-list item-layout="vertical" size="large" :pagination="pagination" :data-source="listData">
      <template #footer>
        <div>
          <b>ant design vue</b>
          footer part
        </div>
      </template>
      <template #renderItem="{ item }">
        <a-list-item key="item.title">
          <template #actions>
            <span v-for="{ icon, text } in actions" :key="icon">
              <component :is="icon" style="margin-right: 8px" />
              {{ text }}
            </span>
          </template>
          <template #extra>
            <img
              width="272"
              alt="logo"
              src="https://gw.alipayobjects.com/zos/rmsportal/mqaQswcyDLcXyDKnZfES.png" />
          </template>
          <a-list-item-meta :description="item.description">
            <template #title>
              <a :href="item.href">{{ item.title }}</a>
            </template>
            <template #avatar><a-avatar :src="item.avatar" /></template>
          </a-list-item-meta>
          {{ item.content }}
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { onMounted } from 'vue';

const route = useRoute();

onMounted(() => {
  console.log('route', route.params.key);
});
import { StarOutlined, LikeOutlined, MessageOutlined } from '@ant-design/icons-vue';
const listData: Record<string, string>[] = [];

for (let i = 0; i < 23; i++) {
  listData.push({
    href: 'https://www.antdv.com/',
    title: `ant design vue part ${i}`,
    avatar: 'https://joeschmoe.io/api/v1/random',
    description:
      'Ant Design, a design language for background applications, is refined by Ant UED Team.',
    content:
      'We supply a series of design principles, practical patterns and high quality design resources (Sketch and Axure), to help people create their product prototypes beautifully and efficiently.',
  });
}

const pagination = {
  onChange: (page: number) => {
    console.log(page);
  },
  pageSize: 15,
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const actions: Record<string, any>[] = [
  { icon: StarOutlined, text: '156' },
  { icon: LikeOutlined, text: '156' },
  { icon: MessageOutlined, text: '2' },
];
</script>

<style scoped>
.songs-search-result {
  padding: 20px 0;
  overflow: clip;
  padding-bottom: 40px;
}
</style>

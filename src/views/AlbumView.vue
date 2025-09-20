<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main>{{ currentId }}</main>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
const route = useRoute();

const currentId = ref('');
onMounted(() => {
  currentId.value = route.params.key as string;
});

watch(
  () => route.params.key,
  (newId) => {
    if (newId) {
      currentId.value = newId as string;
    }
  }
);
</script>


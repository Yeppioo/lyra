<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <main>{{ key }}</main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const key = ref('');
const route = useRoute();
onMounted(() => {
  key.value = route.params.key as string;
});
</script>

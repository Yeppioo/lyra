import './assets/css/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon,
  FontAwesomeLayers,
  FontAwesomeLayersText,
} from '@fortawesome/vue-fontawesome';
library.add(fas);


const app = createApp(App);



app.component('font-awesome-icon', FontAwesomeIcon);
app.component('font-awesome-layers', FontAwesomeLayers);
app.component('font-awesome-layers-text', FontAwesomeLayersText);

app.use(createPinia());
app.use(router);

import { initializeApplication } from './utils/appInitializer';
initializeApplication();

app.use(Antd).mount('#app');

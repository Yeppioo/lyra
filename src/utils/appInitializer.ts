import { useUIPropertiesStore } from '../stores/uiProperties';
import { useSettingsStore } from '../stores/settings';
import { watch } from 'vue';
import router from '@/router'; // 假设你的路由实例在 '@/router'

export function initializeApplication() {
  const uiPropertiesStore = useUIPropertiesStore();
  const settingsStore = useSettingsStore();

  // 页面加载时尝试检查登录状态
  settingsStore.checkLoginStatus(uiPropertiesStore);

  // 监听登录状态变化，更新UI消息或跳转
  watch(
    () => uiPropertiesStore.uiProperties.loginStatus,
    (newStatus) => {
      switch (newStatus) {
        case 'loggingIn':
          uiPropertiesStore.setLoginMessage('登录中...', true);
          break;
        case 'loggedIn':
          uiPropertiesStore.setLoginMessage('登录成功', false); // 登录成功后隐藏消息
          break;
        case 'loginFailed':
          uiPropertiesStore.setLoginMessage('登录失败，请稍后重试', true);
          break;
        case 'loginExpired':
          uiPropertiesStore.setLoginMessage('登录过期，请重新登录', true);
          router.push('/login'); // 跳转到登录页面
          break;
        default:
          uiPropertiesStore.setShowLoginMessage(false);
          break;
      }
    },
    { immediate: true }
  );

  uiPropertiesStore.fetchPersonalizedSongs();
  uiPropertiesStore.fetchSearchData();
}

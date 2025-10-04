import { useSettingsStore } from '@/stores/settings';
const s = useSettingsStore();

export const config = {
  realIP: '116.25.146.177',
  api: {
    netease: s.settings.api.netease,
  },
};

import { useUIPropertiesStore } from '../stores/uiProperties';

export function initializeApplication() {
  const uiPropertiesStore = useUIPropertiesStore();
  uiPropertiesStore.fetchPersonalizedSongs();
  uiPropertiesStore.fetchSearchData();
}

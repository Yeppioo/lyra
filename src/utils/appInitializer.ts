import { useUIPropertiesStore } from '../constant/uiProperties';

export function initializeApplication() {
  const uiPropertiesStore = useUIPropertiesStore();
  uiPropertiesStore.fetchPersonalizedSongs();
  uiPropertiesStore.fetchSearchData();
}

import router from '@/router';

export function jumpArtist(id: string | number) {
  router.push(`/artist/${id}/song`);
}

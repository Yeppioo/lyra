import router from '@/router';

export function jumpArtist(id: string | number) {
  router.push(`/artist/${id}/song`);
}

export function jumpAlbum(id: string | number) {
  router.push(`/album/${id}`);
}

export function jumpVideo(id: string | number) {
  router.push(`/video/${id}`);
}

export function jumpSong(id: string | number) {
  router.push(`/song/${id}`);
}

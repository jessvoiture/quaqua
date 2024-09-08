import { writable } from 'svelte/store';

export const hoveredAlbum = writable(undefined);
export const hoveredArtist = writable(undefined);
export const mouseX = writable(undefined);
export const mouseY = writable(undefined);

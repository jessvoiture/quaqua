import { writable } from 'svelte/store';

export const hoveredDatapoint = writable(undefined);
export const mouseX = writable(undefined);
export const mouseY = writable(undefined);

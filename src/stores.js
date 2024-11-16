import { writable } from 'svelte/store';

export const hoveredData = writable(undefined);
export const hoveredLabelRow = writable(undefined);
export const mouseX = writable(undefined);
export const mouseY = writable(undefined);
export const isPlaying = writable(false);
export const isDataHovered = writable(false);

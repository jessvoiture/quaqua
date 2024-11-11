<script>
	import { browser } from '$app/environment';
	import Triangles from '../components/Triangles.svelte';
	import ScrollyBarcode from '../components/ScrollyBarcode.svelte';
	import Scatterplot from '../components/Scatterplot.svelte';
	import Hero from '../components/Hero.svelte';
	import SpotifyPlayer from '../components/SpotifyPlayer.svelte';

	export let data;

	const artists = data.artists;
	const flattened = data.flattenedData;
	const albumsSorted = data.albumsSorted;
	const artistsSorted = data.artistsSorted;

	let screenWidth;
	let screenHeight;

	function resize() {
		screenWidth = window.innerWidth;
		screenHeight = window.innerHeight;
	}

	if (browser) {
		resize();
	}
</script>

<svelte:window on:resize={resize} />

<div class="content">
	<!-- <Hero {screenWidth} {screenHeight} /> -->
	<ScrollyBarcode {screenWidth} {screenHeight} {albumsSorted} {artistsSorted} />
	<!-- <Triangles {screenWidth} {screenHeight} {artists} />
	<Scatterplot {screenWidth} {screenHeight} data={flattened} /> -->

	<SpotifyPlayer />
</div>

<script>
	import { browser } from '$app/environment';
	import Barcode from '../components/Barcode.svelte';
	import Triangles from '../components/Triangles.svelte';
	import Demonstration from '../components/Demonstration.svelte';

	export let data;

	const artists = data.artists;

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

<!-- <Barcode {screenWidth} {screenHeight} {artists} /> -->
<Demonstration {screenWidth} {screenHeight} {artists} />
<Triangles {screenWidth} {screenHeight} {artists} />

<script>
	import { browser } from '$app/environment';
	import Paragraph from '../copy/Paragraph.svelte';
	import Triangles from '../components/Triangles.svelte';
	import Wrapper from '../components/ScrollyBarcode/Wrapper.svelte';
	import Scatterplot from '../components/Scatterplot.svelte';
	import Hero from '../components/Hero.svelte';
	import SpotifyPlayer from '../components/SpotifyPlayer.svelte';
	import WrapperBillboard from '../components/ScrollyBarcode/WrapperBillboard.svelte';

	export let data;

	let y = 0;

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

<svelte:window on:resize={resize} bind:scrollY={y} />

<div class="content">
	<Hero {screenWidth} {screenHeight} {y} />
	<SpotifyPlayer {screenWidth} />
	<Paragraph hasHeader={false} content={['Hook em']} />
	<Paragraph hasHeader={true} header="Years Active" content={['Intelligent Insight']} />
	<Wrapper {screenWidth} {screenHeight} {albumsSorted} {artistsSorted} />
	<Paragraph
		hasHeader={true}
		header="BB"
		content={['You best believe these albums are not created equally']}
	/>
	<WrapperBillboard {screenWidth} {screenHeight} {albumsSorted} {artistsSorted} />
	<!-- <Paragraph hasHeader={true} header="Gaps" content={['Gaps']} />
	<Triangles {screenWidth} {screenHeight} {artists} /> -->
	<Scatterplot {screenWidth} {screenHeight} data={flattened} />
</div>

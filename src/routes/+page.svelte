<script>
	import { browser } from '$app/environment';
	import Barcode from '../components/Barcode.svelte';
	import Triangles from '../components/Triangles.svelte';
	import Demonstration from '../components/Demonstration.svelte';
	import ScrollyBarcode from '../components/ScrollyBarcode.svelte';

	export let data;

	const artists = data.artists;

	const flattenedArtists = artists.flatMap((artistEntry) =>
		artistEntry.albums.map((album) => ({
			artist: artistEntry.artist,
			album: album.album,
			album_release_date: album.album_release_date,
			type: album.type,
			first_album_release_date: album.first_album_release_date,
			days_since_first_release: album.days_since_first_release,
			days_since_last_release: album.days_since_last_release,
			notes: album.notes
		}))
	);

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
<ScrollyBarcode {screenWidth} {screenHeight} {flattenedArtists} />
<Demonstration {screenWidth} {screenHeight} {artists} />
<Triangles {screenWidth} {screenHeight} {artists} />

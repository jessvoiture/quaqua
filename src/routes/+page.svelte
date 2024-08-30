<script>
	import { browser } from '$app/environment';
	import Barcode from '../components/Barcode.svelte';
	import Triangles from '../components/Triangles.svelte';
	import ScrollyDemo from '../components/ScrollyDemo.svelte';
	import ScrollyBarcode from '../components/ScrollyBarcode.svelte';
	import Scatterplot from '../components/Scatterplot.svelte';

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

	const minReleaseDate = new Date(
		Math.min(...flattenedArtists.map((album) => new Date(album.album_release_date)))
	);

	// Add days_since_min_release_date to the data
	let flattened = flattenedArtists.map((album) => {
		const albumReleaseDate = new Date(album.album_release_date);

		const daysSinceMinReleaseDate = Math.floor(
			(albumReleaseDate - minReleaseDate) / (1000 * 60 * 60 * 24)
		);

		return {
			...album,
			days_since_min_release_date: daysSinceMinReleaseDate
		};
	});

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
<ScrollyBarcode {screenWidth} {screenHeight} data={flattened} />
<ScrollyDemo {screenWidth} {screenHeight} {artists} />
<Triangles {screenWidth} {screenHeight} {artists} />
<Scatterplot {screenWidth} {screenHeight} data={flattened} />

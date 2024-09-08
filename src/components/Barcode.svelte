<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import Tooltip from './Tooltip.svelte';
	import { hoveredAlbum, mouseX, mouseY } from '../stores';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	let width;

	artists.sort((a, b) => {
		const maxA = Math.max(...a.albums.map((album) => album.days_since_first_release));
		const maxB = Math.max(...b.albums.map((album) => album.days_since_first_release));
		return maxB - maxA;
	});

	$: width = 0.9 * screenWidth;

	let artistsDaysActive = artists.flatMap((artist) =>
		artist.albums.map((album) => album.days_since_first_release)
	);

	$: xScale = scaleLinear()
		.domain(extentDaysActive)
		.range([0, width - 120]);

	const handleMouseover = function (event, d) {
		hoveredAlbum.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseout = function () {
		hoveredAlbum.set(undefined);
	};
</script>

<svg {width} height={40 * 25}>
	<g>
		{#each artists as artist, i}
			<g transform={`translate(0, ${i * 20})`}>
				<text transform={`translate(0, 15)`}>{artist.artist}</text>
				<g transform={`translate(120, 0)`}>
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					{#each artist.albums as album}
						<!-- svelte-ignore missing-declaration -->
						<rect
							x={xScale(album.days_since_first_release)}
							y="6"
							width="1"
							height="12"
							on:mouseover={function (event) {
								handleMouseover(event, album);
							}}
							on:mouseout={function () {
								handleMouseout();
							}}
						/>
					{/each}
				</g>
			</g>
		{/each}
	</g>
</svg>

{#if $hoveredAlbum != undefined}
	<Tooltip {screenWidth} {screenHeight} />
{/if}

<style>
	text {
		font-size: 12px;
	}
</style>

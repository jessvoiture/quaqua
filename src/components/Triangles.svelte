<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import Tooltip from './Tooltip.svelte';
	import { hoveredDatapoint, mouseX, mouseY } from '../stores';
	import { scale } from 'svelte/transition';

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

	let extentDaysActive = extent(artistsDaysActive);

	let artistsDaysBetweenRelease = artists.flatMap((artist) =>
		artist.albums.map((album) => album.days_since_last_release)
	);

	let extentDaysBetweenRelease = extent(artistsDaysBetweenRelease);

	$: xScale = scaleLinear()
		.domain(extentDaysActive)
		.range([0, width - 120]);

	$: yScale = scaleLinear().domain(extentDaysBetweenRelease).range([0, 100]);

	const handleMouseover = function (event, d) {
		hoveredDatapoint.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseout = function () {
		hoveredDatapoint.set(undefined);
	};
</script>

<svg {width} height={40 * 120}>
	<g>
		{#each artists as artist, i}
			<g transform={`translate(0, ${i * 100})`}>
				<text transform={`translate(0, 20)`}>{artist.artist}</text>
				<g transform={`translate(120, 0)`}>
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<!-- svelte-ignore a11y-mouse-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					{#each artist.albums as album}
						<!-- svelte-ignore missing-declaration -->
						<polyline
							points="
                            {xScale(
								album.days_since_first_release - album.days_since_last_release
							)},0
                            {xScale(album.days_since_first_release)},{yScale(
								album.days_since_last_release
							)} 
                            {xScale(album.days_since_first_release)},0 
                            "
							opacity="0.7"
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

{#if $hoveredDatapoint != undefined}
	<Tooltip {screenWidth} {screenHeight} />
{/if}

<style>
	text {
		font-size: 12px;
	}
</style>

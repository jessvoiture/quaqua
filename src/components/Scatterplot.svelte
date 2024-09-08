<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import TooltipAlbum from './TooltipAlbum.svelte';
	import { hoveredAlbum, mouseX, mouseY } from '../stores';

	export let data;
	export let screenHeight;
	export let screenWidth;

	const nonDebutAlbums = data.filter((d) => d.days_since_first_release != 0);

	const padding = 15;

	let xExtent = extent(data, (d) => d.days_since_min_release_date);
	let yExtent = extent(data, (d) => d.days_since_last_release);

	$: width = 0.8 * screenWidth;
	$: height = 0.6 * screenHeight;

	$: innerWidth = width - 2 * padding;
	$: innerHeight = height - 2 * padding;

	$: xScale = scaleLinear().domain([0, xExtent[1]]).range([0, innerWidth]);
	$: yScale = scaleLinear().domain([0, 4380]).range([innerHeight, 0]);

	const handleMouseover = function (event, d) {
		hoveredAlbum.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseout = function () {
		hoveredAlbum.set(undefined);
	};
</script>

<svg {width} {height}>
	<g width={innerWidth} height={innerHeight} transform={`translate(${padding}, ${padding})`}>
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		{#each nonDebutAlbums as d}
			<!-- svelte-ignore missing-declaration -->
			<circle
				cx={xScale(d.days_since_min_release_date)}
				cy={yScale(d.days_since_last_release)}
				r="3"
				on:mouseover={function (event) {
					handleMouseover(event, d);
				}}
				on:mouseout={function () {
					handleMouseout();
				}}
			/>
		{/each}
	</g>
</svg>

{#if $hoveredAlbum != undefined}
	<TooltipAlbum {screenWidth} {screenHeight} />
{/if}

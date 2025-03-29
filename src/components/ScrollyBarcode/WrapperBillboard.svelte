<script>
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent, max } from 'd3-array';
	import { steps } from '../../lib/billboardSteps.js';

	import Tooltip from '../Tooltip.svelte';
	import AxisX from './axisX.svelte';
	import Scrolly from '../Scrolly.svelte';
	import ArtistLabels from './ArtistLabels.svelte';
	import Barcode from './Barcode.svelte';
	import { hoveredData, isDataHovered } from '../../stores.js';

	export let albumsSorted;
	export let artistsSorted;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedX;
	let tweenedSizeWidth;
	let tweenedSizeHeight;
	let tweenedNames;
	let height;
	let width;

	let rectHeight = 8;
	let currentStep = 0;
	let colourClass = 'white';
	let highlightedAlbums = [];
	let isCircle = false;

	const padding = { left: 128, right: 8, top: 16, bottom: 56 };
	const stepWidth = 300;
	const rectWidth = 1;
	const rectTouchAreaSize = 16;

	// // Get unique artist count
	const uniqueArtists = artistsSorted.map((d) => d.artist);
	const uniqueArtistCount = uniqueArtists.length;

	// find the date of the earliest debut album
	const minReleaseDate = new Date(
		Math.min(...albumsSorted.map((album) => new Date(album.album_release_date)))
	);

	const yExtent = extent(artistsSorted.map((d) => d.indexByDebutDate));
	const xExtent = extent(albumsSorted.map((d) => d.days_since_first_release));
	const sizeExtent = extent(albumsSorted.map((d) => d.wks_on_chart_norm));

	// Responsive sizing
	$: if (screenWidth < 960) {
		height = 0.8 * screenHeight;
		width = 0.9 * screenWidth;
	} else {
		height = 0.8 * screenHeight;
		width = 0.6 * screenWidth;
	}

	$: innerWidth = width - padding.left - padding.right;
	$: innerHeight = height - padding.top - padding.bottom;
	$: rectHeight = innerHeight / uniqueArtistCount - 4;

	// Initialize tweened variables
	$: tweenedX = tweened(albumsSorted.map((d) => d.days_since_first_release));
	$: tweenedY = tweened(albumsSorted.map((d) => d.indexByDaysActive));
	$: tweenedNames = tweened(artistsSorted.map((d) => d.indexByDaysActive));
	$: tweenedSizeWidth = tweened(albumsSorted.map((d) => rectWidth));
	$: tweenedSizeHeight = tweened(albumsSorted.map((d) => rectHeight));

	// Define scales
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
	$: yScale = scaleLinear().domain(yExtent).range([0, innerHeight]);
	$: sizeScale = scaleLinear()
		.domain(sizeExtent)
		.range([2, rectHeight * 1.5]);

	// Update the positions according to the current step
	// 0: show barcode
	$: if (currentStep === 0) {
		isCircle = false;
		setBarcode();
	} else if (currentStep >= 1) {
		isCircle = true;
		setSize();
	}

	const setBarcode = () => {
		tweenedSizeWidth.set(albumsSorted.map((d) => rectWidth));
		tweenedSizeHeight.set(albumsSorted.map((d) => rectHeight));
	};

	const setSize = () => {
		tweenedSizeWidth.set(albumsSorted.map((d) => sizeScale(d.wks_on_chart_norm)));
		tweenedSizeHeight.set(albumsSorted.map((d) => sizeScale(d.wks_on_chart_norm)));
	};
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height} aria-labelledby="chartTitle">
			<h2 id="chartTitle" class="visually-hidden">
				Chart comparing album release dates for best-selling artists
			</h2>

			<g class="chart-wrapper" transform={`translate(0, ${padding.top})`}>
				<!-- Y Axis Label -->
				<ArtistLabels {artistsSorted} {yScale} {tweenedNames} {width} {rectHeight} />

				<!-- The Charts -->
				<g transform={`translate(${padding.left}, 0)`} class="chart-and-axis">
					<AxisX
						{xScale}
						currentStep={4}
						{innerWidth}
						{innerHeight}
						{minReleaseDate}
						{rectHeight}
					/>

					<!-- Barcode -->
					<Barcode
						{albumsSorted}
						{xScale}
						{yScale}
						{rectTouchAreaSize}
						{rectHeight}
						{tweenedX}
						{tweenedY}
						{tweenedSizeWidth}
						{tweenedSizeHeight}
						{isCircle}
						{colourClass}
						{highlightedAlbums}
						borderRadius="100"
					/>
				</g>
			</g>
		</svg>
	</div>

	<!-- Scrolly -->
	<div class="steps-wrapper" role="navigation" aria-label="Scrollytelling Steps">
		<Scrolly bind:value={currentStep}>
			{#each steps as text, i}
				<div class="step" class:active={currentStep === i}>
					<div class="step-content" width={stepWidth}>
						{@html text}
					</div>
				</div>
			{/each}
		</Scrolly>
	</div>
</div>

<!-- Tooltip -->
{#if ($hoveredData != undefined) & $isDataHovered}
	<Tooltip
		{screenHeight}
		{screenWidth}
		showingRelativeRelease={true}
		{albumsSorted}
		showingBillboardWeeks={isCircle}
	/>
{/if}

<style lang="scss">
	.plot {
		position: sticky;
		margin: auto;
		flex: 1 1 60%;
		top: 0vh;
		height: calc(100vh - 56px);
		z-index: 0 !important;

		@include center-flex-vertically-and-horizontally;
	}
</style>

<script>
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { steps } from '../../lib/steps.js';

	import Tooltip from '../Tooltip.svelte';
	import AxisX from './axisX.svelte';
	import Scrolly from '../Scrolly.svelte';
	import ArtistLabels from './ArtistLabels.svelte';
	import Bars from './Bars.svelte';
	import Barcode from './Barcode.svelte';
	import { hoveredData, isDataHovered } from '../../stores.js';

	export let albumsSorted;
	export let artistsSorted;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedX;
	let tweenedBarWidth;
	let tweenedNames;
	let height;
	let width;

	let rectHeight = 8;
	let currentStep = 0;
	let xExtent = [0, 0];
	let colourClass = 'white';
	let highlightedArtists = [];

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
	$: tweenedX = tweened(albumsSorted.map((d) => d.days_since_min_release_date));
	$: tweenedY = tweened(albumsSorted.map((d) => d.indexByDebutDate));
	$: tweenedBarWidth = tweened(artistsSorted.map(() => 0));
	$: tweenedNames = tweened(artistsSorted.map((d) => d.indexByDebutDate));

	// Define scales
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
	$: yScale = scaleLinear().domain(yExtent).range([0, innerHeight]);

	// Update the positions according to the current step
	// 0: sorted by date of debut
	$: if (currentStep === 0) {
		setReleaseDate();
		xExtent = extent($tweenedX);
		colourClass = 'white';
		// 1: x axis by days since debut
	} else if (currentStep === 1) {
		setDiffToDebut();
		xExtent = extent($tweenedX);
		colourClass = 'white';
		// 2: add bars
	} else if (currentStep === 2) {
		setBarYearsActive();
		xExtent = extent($tweenedX);
		colourClass = 'black';
		// 3: sort by time active
	} else if (currentStep >= 3) {
		setYVals();
		xExtent = [0, 20339];
		colourClass = 'black';
	}

	// Step functions
	// 0: sorted by date of debut
	const setReleaseDate = () => {
		tweenedX.set(albumsSorted.map((d) => d.days_since_min_release_date));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDebutDate));
	};

	// 1: x axis by days since debut
	const setDiffToDebut = () => {
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDebutDate));
	};

	// 2: add bars
	const setBarYearsActive = () => {
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDebutDate));
	};

	// 3: sorted by days since debut
	const setYVals = () => {
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDaysActive));
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDaysActive));
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
						{currentStep}
						{innerWidth}
						{innerHeight}
						{minReleaseDate}
						{screenWidth}
						{rectHeight}
					/>

					<!-- Bars -->
					<Bars {artistsSorted} {yScale} {xScale} {tweenedNames} {tweenedBarWidth} {rectHeight} />

					<!-- Barcode -->
					<Barcode
						{albumsSorted}
						{xScale}
						{yScale}
						{rectTouchAreaSize}
						{tweenedX}
						{tweenedY}
						{colourClass}
						{rectHeight}
						{rectWidth}
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
	<Tooltip {screenHeight} {screenWidth} />
{/if}

<style>
	.plot {
		position: sticky;
		margin: auto;
		flex: 1 1 60%;
		top: 0vh;
		height: calc(100vh - 56px);
		z-index: 0 !important;
		display: flex;
		justify-content: center;
		align-items: center;
	}
</style>

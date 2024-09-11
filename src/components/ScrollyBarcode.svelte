<script>
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import Tooltip from './Tooltip.svelte';
	import AxisX from './axisX.svelte';
	import Scrolly from './Scrolly.svelte';
	import { hoveredData, mouseX, mouseY } from '../stores';

	export let albumsSorted;
	export let artistsSorted;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedYBars;
	let tweenedX;
	let tweenedBarWidth;
	let tweenedNames;
	let height;
	let width;

	let rectHeight = 8;
	let currentStep = 0;
	let xExtent = [0, 0];
	let opacityClass = 'full-opacity';
	let tooltipHoveredOver = 'album';
	let isDataHovered = false;

	const steps = [
		`<p>step 0: x is album release date</p>`,
		'<p>step 1: x is days since debut</p>',
		'<p>step 2: y is sorted by diff to debut</p>',
		'<p>step 3: bar for years active</p>',
		'<p>step 4: bar for years active / album count</p>',
		'<p>step 5: y is sorted for years active / album count</p>'
	];

	const padding = { left: 128, right: 8, top: 8, bottom: 64 };
	const stepWidth = 300;
	const rectWidth = 1;

	// // Get unique artist count
	const uniqueArtists = artistsSorted.map((d) => d.artist);
	const uniqueArtistCount = uniqueArtists.length;

	// find the date of the earliest debut album
	const minReleaseDate = new Date(
		Math.min(...albumsSorted.map((album) => new Date(album.album_release_date)))
	);

	const yExtent = extent(artistsSorted.map((d) => d.indexByDebutDate));

	// Responsive sizing
	$: if (screenWidth <= 860) {
		height = 0.9 * screenHeight;
		width = 0.9 * screenWidth;
	} else {
		height = 0.8 * screenHeight;
		width = 0.8 * screenWidth;
	}
	$: innerWidth = width - padding.left - padding.right;
	$: innerHeight = height - padding.top - padding.bottom;
	$: rectHeight = innerHeight / uniqueArtistCount - 4;

	// Initialize tweened variables
	$: tweenedX = tweened(albumsSorted.map((d) => d.days_since_min_release_date));
	$: tweenedY = tweened(albumsSorted.map((d) => d.indexByDebutDate));
	$: tweenedBarWidth = tweened(artistsSorted.map(() => 0));
	$: tweenedYBars = tweened(artistsSorted.map((d) => d.indexByDaysActive));
	$: tweenedNames = tweened(artistsSorted.map((d) => d.indexByDebutDate));

	// Define scales
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
	$: yScale = scaleLinear().domain(yExtent).range([0, innerHeight]);

	// Update the positions according to the current step
	// 0: sorted by date of debut
	$: if (currentStep === 0) {
		setReleaseDate();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
		// 1: x axis by days since debut
	} else if (currentStep === 1) {
		setDiffToDebut();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
		// 2: sorted by days since debut
	} else if (currentStep === 2) {
		setYVals();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
		// 3: add bars
	} else if (currentStep == 3) {
		setBarYearsActive();
		xExtent = [0, 20339];
		opacityClass = 'transition-opacity';
		// 4: width of bars = days / album
	} else if (currentStep == 4) {
		setBarDaysPerAlbum();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
		// 5: sort bars by days / album
	} else if (currentStep == 5) {
		setBarDaysPerEraLength();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
	}

	// Step functions
	// 0: sorted by date of debut
	const setReleaseDate = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedX.set(albumsSorted.map((d) => d.days_since_min_release_date));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDebutDate));
	};

	// 1: x axis by days since debut
	const setDiffToDebut = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDebutDate));
	};

	// 2: sorted by days since debut
	const setYVals = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDaysActive));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	// 3: add bars
	const setBarYearsActive = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByDaysActive));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	// 4: width of bars = days / album
	const setBarDaysPerAlbum = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease / d.albumCount));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByDaysActive));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	// 5: sort bars by days / album
	const setBarDaysPerEraLength = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease / d.albumCount));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByEraLength));
		tweenedNames.set(artistsSorted.map((d) => d.indexByEraLength));
	};

	const handleMouseover = function (event, d, type) {
		hoveredData.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
		tooltipHoveredOver = type;
		isDataHovered = true;
	};

	const handleMouseout = function () {
		hoveredData.set(undefined);
		isDataHovered = false;
	};
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height}>
			<g class="chart-wrapper" transform={`translate(0, ${padding.top})`}>
				<!-- Y Axis Label -->
				<g class="artist-labels axis yaxis">
					{#each artistsSorted as a, i}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						<g>
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<rect
								class="label-background"
								x="0"
								y={yScale($tweenedNames[i]) - 2}
								{width}
								height={rectHeight + 4}
								fill="#ededed"
								opacity="0"
								rx="4"
								ry="4"
							/>

							<text
								x="8"
								y={yScale($tweenedNames[i]) + rectHeight / 1.1}
								height={rectHeight}
								class="label">{a.artist}</text
							>
						</g>
					{/each}
				</g>

				<!-- The Charts -->
				<g transform={`translate(${padding.left}, 0)`} class="chart-and-axis">
					<AxisX {xScale} {currentStep} {innerWidth} {innerHeight} {minReleaseDate} />

					<!-- Barcode -->
					<g class={opacityClass}>
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						{#each albumsSorted as d, i}
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<rect
								x={xScale($tweenedX[i])}
								y={yScale($tweenedY[i])}
								width={rectWidth}
								height={rectHeight}
								pointer-events="all"
								on:mouseover={function (event) {
									handleMouseover(event, d, 'album');
								}}
								on:mouseout={function () {
									handleMouseout();
								}}
							/>
						{/each}
					</g>

					<!-- Bars -->
					<g>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						{#each artistsSorted as d, i}
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<rect
								class="transition-width"
								x="0"
								y={yScale($tweenedNames[i])}
								width={xScale($tweenedBarWidth[i])}
								height={rectHeight}
								on:mouseover={function (event) {
									handleMouseover(event, d, 'artist');
								}}
								on:mouseout={function () {
									handleMouseout();
								}}
							/>
						{/each}
					</g>
				</g>
			</g>
		</svg>
	</div>

	<!-- Scrolly -->
	<div class="steps-wrapper">
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
{#if ($hoveredData != undefined) & isDataHovered}
	<Tooltip {screenHeight} {screenWidth} type={tooltipHoveredOver} />
{/if}

<style>
	.plot {
		position: sticky;
		margin: auto;
		flex: 1 1 60%;
		top: 0vh;
		height: 100vh;
		z-index: 0 !important;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.transition-width {
		transition: width 0.1s ease-in-out;
		-webkit-transition: width 0.1s ease-in-out;
		-moz-transition: width 0.1s ease-in-out;
		-o-transition: width 0.1s ease-in-out;
	}

	.full-opacity {
		opacity: 1;
	}

	.transition-opacity {
		opacity: 0;
		transition: opacity 0.5s 1s ease-in-out;
		-webkit-transition: opacity 0.5s 1s ease-in-out;
		-moz-transition: opacity 0.5s 1s ease-in-out;
		-o-transition: opacity 0.5s 1s ease-in-out;
	}

	text {
		font-size: 11px;
	}

	.label-background:hover {
		opacity: 100%;
	}
</style>

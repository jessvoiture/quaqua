<script>
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { writable } from 'svelte/store';
	import { steps } from '../lib/steps.js';

	import Tooltip from './Tooltip.svelte';
	import AxisX from './axisX.svelte';
	import Scrolly from './Scrolly.svelte';
	import { hoveredData, mouseX, mouseY } from '../stores';

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
	let opacityClass = 'full-opacity';
	let colourClass = 'white';
	let widthClass = 'first-width-transition';
	let tooltipHoveredOver = 'album';
	let isDataHovered = false;
	let svgAltDesc = '';

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

	const hoveredLabelRow = writable(undefined);

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
		opacityClass = 'full-opacity';
		colourClass = 'white';
		widthClass = 'first-width-transition';
		svgAltDesc =
			'Step 1: A barcode plot with the date on the x axis and the artist on the y axis. Each studio album released by the artist is plotted by the release date. The artists are sorted by the date of their debut album in descending order.';
		// 1: x axis by days since debut
	} else if (currentStep === 1) {
		setDiffToDebut();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
		colourClass = 'white';
		widthClass = 'first-width-transition';
		svgAltDesc =
			'Step 2: The plot has updated. It still displays a barcode plot with the artists on the y axis but the x axis reflects the with time difference between the release date of an artists debut album and of their most recent album on the x axis and the artist on the y axis. Each studio album released by the artist is plotted by the release date. The artists are sorted by the date of their debut album in descending order.';
		// 2: add bars
	} else if (currentStep === 2) {
		setBarYearsActive();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
		colourClass = 'black';
		widthClass = 'first-width-transition';
		svgAltDesc =
			'Step 3: The plot displays the same data as in step 2, but the artists y position has been changed so that the artists are sorted from largest to smallest days active (ie the time in between their debut album and most recent album)';
		// 3: sort by time active
	} else if (currentStep == 3) {
		setYVals();
		xExtent = [0, 20339];
		opacityClass = 'full-opacity';
		colourClass = 'black';
		widthClass = 'first-width-transition';
		svgAltDesc =
			'Step 4: The plot is now a bar chart, still with the same x and y axes. The bars are plotted to represent the time active (ie days between debut album and last album) for each artists.';
		// 4: width of bars = days / album
	} else if (currentStep == 4) {
		setBarDaysPerAlbum();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
		colourClass = 'black';
		widthClass = 'second-width-transition';
		svgAltDesc =
			'Step 5: The x axis measurement changes to reflect the average time in years between album releases (ie the average album era length). The bars for each artists are redrawn to reflect this measurement';
		// 5: sort bars by days / album
	} else if (currentStep == 5) {
		setBarDaysPerEraLength();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
		colourClass = 'black';
		widthClass = 'second-width-transition';
		svgAltDesc =
			'Step 6 (last step): The y position of the artist and their respective bar changes so the artists are sorted by average time between album releases in descending order.';
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

	// 4: width of bars = days / album
	const setBarDaysPerAlbum = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.avgDaysSinceLastRelease));
		tweenedNames.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	// 5: sort bars by days / album
	const setBarDaysPerEraLength = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.avgDaysSinceLastRelease));
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

	const handleMouseoverLabel = function (d) {
		hoveredLabelRow.set(d);
	};

	const handleMouseoutLabel = function (d) {
		hoveredLabelRow.set(undefined);
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
				<g class="artist-labels axis yaxis">
					{#each artistsSorted as a, i}
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						<g>
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<rect
								class={a.artist}
								x="0"
								y={yScale($tweenedNames[i]) - 2}
								{width}
								height={rectHeight + 4}
								fill="#323232"
								opacity={a == $hoveredLabelRow
									? 100
									: isDataHovered
										? a.artist == $hoveredData.artist
											? 100
											: 0
										: 0}
								rx="4"
								ry="4"
								aria-label="Row for {artistsSorted[i]}"
								on:mouseover={function () {
									handleMouseoverLabel(a);
								}}
								on:mouseout={function () {
									handleMouseoutLabel();
								}}
							/>

							<text
								x="8"
								y={yScale($tweenedNames[i]) + rectHeight / 1.1}
								height={rectHeight}
								class="label"
								aria-label={artistsSorted[i]}>{a.artist}</text
							>
						</g>
					{/each}
				</g>

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
					<g>
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						{#each artistsSorted as d, i}
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<rect
								class={widthClass}
								x="0"
								y={yScale($tweenedNames[i])}
								width={xScale($tweenedBarWidth[i])}
								height={rectHeight}
								fill="#dad3c1"
								aria-label="Data point for the {artistsSorted[i]}"
								on:mouseover={function (event) {
									handleMouseover(event, d, 'artist');
								}}
								on:mouseout={function () {
									handleMouseout();
								}}
							/>
						{/each}
					</g>

					<!-- Barcode -->
					<g class={opacityClass}>
						<!-- <g> -->
						<!-- svelte-ignore a11y-mouse-events-have-key-events -->
						{#each albumsSorted as d, i}
							<g class={d.album}>
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<!-- invisible rectangles fo touch area -->
								<rect
									x={xScale($tweenedX[i]) - rectTouchAreaSize / 2}
									y={yScale($tweenedY[i]) - rectTouchAreaSize / 4}
									width={rectTouchAreaSize}
									height={rectTouchAreaSize}
									fill="transparent"
									pointer-events={opacityClass == 'transition-opacity' ? 'none' : 'all'}
									on:mouseover={function (event) {
										handleMouseover(event, d, 'album');
									}}
									on:mouseout={function () {
										handleMouseout();
									}}
								/>

								<!-- visilbe rectangles plotting albums -->
								<rect
									x={xScale($tweenedX[i])}
									y={isDataHovered && $hoveredData.album == d.album
										? yScale($tweenedY[i]) - 0.25 * rectHeight
										: yScale($tweenedY[i])}
									width={isDataHovered && $hoveredData.album == d.album ? rectWidth * 2 : rectWidth}
									height={isDataHovered && $hoveredData.album == d.album
										? rectHeight * 1.5
										: rectHeight}
									class={colourClass}
									pointer-events={opacityClass == 'transition-opacity' ? 'none' : 'all'}
									aria-label="Data point for the album, {d.album} by {d.artist}."
								/>
							</g>
						{/each}
					</g>
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
{#if ($hoveredData != undefined) & isDataHovered}
	<Tooltip {screenHeight} {screenWidth} type={tooltipHoveredOver} />
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

	.first-width-transition {
		transition: width 0.1s ease-out;
		-webkit-transition: width 0.1s ease-out;
		-moz-transition: width 0.1s ease-out;
		-o-transition: width 0.1s ease-out;
	}

	.second-width-transition {
		transition: width 0.5s ease-in-out;
		-webkit-transition: width 0.5s ease-in-out;
		-moz-transition: width 0.5s ease-in-out;
		-o-transition: width 0.5s ease-in-out;
	}

	.full-opacity {
		opacity: 1;
	}

	.transition-opacity {
		opacity: 0;
		/* transition: opacity 0.1s 1s ease-in-out;
		-webkit-transition: opacity 0.1s 1s ease-in-out;
		-moz-transition: opacity 0.1s 1s ease-in-out;
		-o-transition: opacity 0.1s 1s ease-in-out; */
	}

	.white {
		fill: #dad3c1;
	}

	.black {
		fill: #202020;
		transition: fill 0.5s ease;
		-webkit-transition: fill 0.5s 1s ease-in-out;
		-moz-transition: fill 0.5s 1s ease-in-out;
		-o-transition: fill 0.5s 1s ease-in-out;
	}

	.label-background:hover {
		opacity: 100%;
	}
</style>

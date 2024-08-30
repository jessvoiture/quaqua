<script>
	import Scrolly from './Scrolly.svelte';
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';

	import Tooltip from './Tooltip.svelte';
	import { hoveredDatapoint, mouseX, mouseY } from '../stores';

	export let data;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedX;

	const steps = [
		`<p>step 0: x is album release date</p>`,
		'<p>step 1: x is days since debut</p>',
		'<p>step 2: y is sorted by diff to debut</p>'
	];

	const padding = 15;

	let currentStep = 0;
	let stepWidth = 300;

	// Get unique artist count
	const uniqueArtists = [...new Set(data.map((item) => item.artist))];
	const uniqueArtistCount = uniqueArtists.length;

	// Sorting by days_since_min_release_date
	let artistsSortedByDebutDateArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist)) {
				acc.set(album.artist, album.days_since_min_release_date);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => a[1] - b[1])
		.map(([artist]) => artist);

	// Sorting by days_since_first_release
	let artistsSortedByDaysActiveArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist) || acc.get(album.artist) < album.days_since_first_release) {
				acc.set(album.artist, album.days_since_first_release);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => b[1] - a[1])
		.map(([artist]) => artist);

	// Define the Y positions
	let yPositionsDebut = new Map(
		artistsSortedByDebutDateArray.map((artist, index) => [artist, index + 1])
	);
	let yPositionsActive = new Map(
		artistsSortedByDaysActiveArray.map((artist, index) => [artist, index + 1])
	);

	// Merge data with yPositionsDebut and yPositionsActive
	let dataSorted = data.map((album) => ({
		...album,
		indexByDebutDate: yPositionsDebut.get(album.artist),
		indexByDaysActive: yPositionsActive.get(album.artist)
	}));

	// Responsive sizing
	$: width = 0.8 * screenWidth;
	$: height = 0.8 * screenHeight;
	$: innerWidth = width - 2 * padding;
	$: innerHeight = height - 2 * padding;

	// Initialize tweened variables
	$: tweenedX = tweened(dataSorted.map((d) => d.days_since_min_release_date));
	$: tweenedY = tweened(dataSorted.map((d) => d.indexByDebutDate));

	// Define scales
	$: xExtent = extent($tweenedX);
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);

	$: yScaleLinear = scaleLinear().domain([0, uniqueArtistCount]).range([0, innerHeight]);

	// Update the positions according to the current step
	$: if (currentStep === 0) {
		setReleaseDate();
	} else if (currentStep === 1) {
		setDiffToDebut();
	} else if (currentStep === 2) {
		setYVals();
	}

	// Step functions
	const setDiffToDebut = () => {
		tweenedX.set(dataSorted.map((d) => d.days_since_first_release));
		tweenedY.set(dataSorted.map((d) => d.indexByDebutDate));
	};

	const setReleaseDate = () => {
		tweenedX.set(dataSorted.map((d) => d.days_since_min_release_date));
		tweenedY.set(dataSorted.map((d) => d.indexByDebutDate));
	};

	const setYVals = () => {
		// tweenedX.set(dataSorted.map((d) => d.days_since_min_release_date));
		tweenedY.set(dataSorted.map((d) => d.indexByDaysActive));
	};

	const handleMouseover = function (event, d) {
		hoveredDatapoint.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseout = function () {
		hoveredDatapoint.set(undefined);
	};
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height}>
			<g width={innerWidth} height={innerHeight} transform={`translate(${padding}, ${padding})`}>
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				{#each dataSorted as d, i}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<rect
						x={xScale($tweenedX[i])}
						y={yScaleLinear($tweenedY[i])}
						width="1"
						height="12"
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
	</div>

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

{#if $hoveredDatapoint != undefined}
	<Tooltip {screenWidth} {screenHeight} />
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
</style>

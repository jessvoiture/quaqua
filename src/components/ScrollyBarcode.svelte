<script>
	import Scrolly from './Scrolly.svelte';
	import { tweened } from 'svelte/motion';
	import { scaleLinear } from 'd3-scale';
	import { extent, rollup, max } from 'd3-array';
	import { slide, fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';

	import TooltipAlbum from './TooltipAlbum.svelte';
	import TooltipArtist from './TooltipArtist.svelte';
	import { hoveredAlbum, hoveredArtist, mouseX, mouseY } from '../stores';

	export let data;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedYBars;
	let tweenedX;
	let tweenedBarWidth;
	let rectHeight = 8;
	let currentStep = 0;
	let xExtent = [0, 0];
	let opacityClass = 'full-opacity';

	const steps = [
		`<p>step 0: x is album release date</p>`,
		'<p>step 1: x is days since debut</p>',
		'<p>step 2: y is sorted by diff to debut</p>',
		'<p>step 3: bar for years active</p>',
		'<p>step 4: bar for years active / album count</p>',
		'<p>step 5: y is sorted for years active / album count</p>'
	];

	const padding = 15;
	const stepWidth = 300;
	const rectWidth = 1;

	// Get unique artist count
	const uniqueArtists = [...new Set(data.map((item) => item.artist))];
	const uniqueArtistCount = uniqueArtists.length;

	// Sorting by days_since_min_release_date
	const artistsSortedByDebutDateArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist)) {
				acc.set(album.artist, album.days_since_min_release_date);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => a[1] - b[1])
		.map(([artist]) => artist);

	// Sorting by days_since_first_release (days active)
	const artistsSortedByDaysActiveArray = Array.from(
		data.reduce((acc, album) => {
			if (!acc.has(album.artist) || acc.get(album.artist) < album.days_since_first_release) {
				acc.set(album.artist, album.days_since_first_release);
			}
			return acc;
		}, new Map())
	)
		.sort((a, b) => b[1] - a[1])
		.map(([artist]) => artist);

	// Define the Y positions by debut release date
	// create map of artist with rank based on sorting (ie ranked by date of first release)
	const yPositionsDebut = new Map(
		artistsSortedByDebutDateArray.map((artist, index) => [artist, index + 1])
	);

	// Define the Y positions by days active
	// create map of artist with rank based on sorting (ie ranked by the number of days active)
	const yPositionsActive = new Map(
		artistsSortedByDaysActiveArray.map((artist, index) => [artist, index + 1])
	);

	// Merge data with yPositionsDebut and yPositionsActive
	// get index of artist in sorted array
	// used to plot the albums in the bar code plot
	const albumsSorted = data.map((album) => ({
		...album,
		indexByDebutDate: yPositionsDebut.get(album.artist),
		indexByDaysActive: yPositionsActive.get(album.artist)
	}));

	// aggregate data by artist
	// calculate the number of albums per artist and the max days_since_first_release (total days active)
	// this creates a map
	const artistStats = rollup(
		data,
		(v) => ({
			count: v.length, // Count the number of albums
			maxDaysSinceFirstRelease: max(v, (d) => d.days_since_first_release) // Find the maximum days_since_first_release
		}),
		(d) => d.artist // Group by artist
	);

	// Convert the Map to an array of objects for easier use
	const artists = Array.from(artistStats, ([data, stats]) => ({
		data,
		albumCount: stats.count,
		maxDaysSinceFirstRelease: stats.maxDaysSinceFirstRelease,
		eraLength: stats.maxDaysSinceFirstRelease / stats.count
	}));

	const yPositionEraLength = new Map(
		[...artists]
			.sort((a, b) => b.eraLength - a.eraLength) // Sort by eraLength descending
			.map((item, index) => [item.data, index + 1]) // Map artist to rank
	);

	const artistsSorted = artists.map((d) => {
		return {
			...d,
			indexByDaysActive: yPositionsActive.get(d.data),
			indexByDebutDate: yPositionsDebut.get(d.data),
			indexByEraLength: yPositionEraLength.get(d.data)
		};
	});

	console.log(
		'artistssortedby Era',
		albumsSorted.map((d) => d.indexByEraLength)
	);
	console.log(
		'artistssortedby active',
		albumsSorted.map((d) => d.indexByDaysActive)
	);

	// Responsive sizing
	$: width = 0.8 * screenWidth;
	$: height = 0.8 * screenHeight;
	$: innerWidth = width - 2 * padding;
	$: innerHeight = height - 2 * padding;
	$: rectHeight = innerHeight / uniqueArtistCount - 2;

	// Initialize tweened variables
	$: tweenedX = tweened(albumsSorted.map((d) => d.days_since_min_release_date));
	$: tweenedY = tweened(albumsSorted.map((d) => d.indexByDebutDate));
	$: tweenedBarWidth = tweened(artistsSorted.map(() => 0));
	$: tweenedYBars = tweened(artistsSorted.map((d) => d.indexByDaysActive));

	// Define scales
	// $: xExtent = extent($tweenedX);
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
	$: yScale = scaleLinear().domain([0, uniqueArtistCount]).range([0, innerHeight]);

	// Update the positions according to the current step
	$: if (currentStep === 0) {
		setReleaseDate();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
	} else if (currentStep === 1) {
		setDiffToDebut();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
	} else if (currentStep === 2) {
		setYVals();
		xExtent = extent($tweenedX);
		opacityClass = 'full-opacity';
	} else if (currentStep == 3) {
		setBarYearsActive();
		xExtent = [0, 20339];
		opacityClass = 'transition-opacity';
	} else if (currentStep == 4) {
		setBarDaysPerAlbum();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
	} else if (currentStep == 5) {
		setBarDaysPerEraLength();
		xExtent = [0, 2000];
		opacityClass = 'transition-opacity';
	}

	// Step functions
	const setDiffToDebut = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedX.set(albumsSorted.map((d) => d.days_since_first_release));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
	};

	const setReleaseDate = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedX.set(albumsSorted.map((d) => d.days_since_min_release_date));
		tweenedY.set(albumsSorted.map((d) => d.indexByDebutDate));
	};

	const setYVals = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => 0));
		tweenedY.set(albumsSorted.map((d) => d.indexByDaysActive));
	};

	const setBarYearsActive = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	const setBarDaysPerAlbum = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease / d.albumCount));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByDaysActive));
	};

	const setBarDaysPerEraLength = () => {
		tweenedBarWidth.set(artistsSorted.map((d) => d.maxDaysSinceFirstRelease / d.albumCount));
		tweenedYBars.set(artistsSorted.map((d) => d.indexByEraLength));
	};

	const handleMouseoverAlbum = function (event, d) {
		hoveredAlbum.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseoutAlbum = function () {
		hoveredAlbum.set(undefined);
	};

	const handleMouseoverArtist = function (event, d) {
		hoveredArtist.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
	};

	const handleMouseoutArtist = function () {
		hoveredArtist.set(undefined);
	};
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height}>
			<g
				width={innerWidth}
				height={innerHeight}
				transform={`translate(${padding}, ${padding})`}
				class={opacityClass}
			>
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				{#each albumsSorted as d, i}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<rect
						x={xScale($tweenedX[i])}
						y={yScale($tweenedY[i])}
						width={rectWidth}
						height={rectHeight}
						on:mouseover={function (event) {
							handleMouseoverAlbum(event, d);
						}}
						on:mouseout={function () {
							handleMouseoutAlbum();
						}}
					/>
				{/each}
			</g>

			<g width={innerWidth} height={innerHeight} transform={`translate(${padding}, ${padding})`}>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<!-- svelte-ignore a11y-mouse-events-have-key-events -->
				{#each artistsSorted as d, i}
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<rect
						class="transition-width"
						x="0"
						y={yScale($tweenedYBars[i])}
						width={xScale($tweenedBarWidth[i])}
						height={rectHeight}
						on:mouseover={function (event) {
							handleMouseoverArtist(event, d);
						}}
						on:mouseout={function () {
							handleMouseoutArtist();
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

{#if $hoveredAlbum != undefined}
	<TooltipAlbum {screenWidth} {screenHeight} />
{/if}

{#if $hoveredArtist != undefined}
	<TooltipArtist {screenWidth} {screenHeight} />
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
		transition: width 0.25s ease-in-out;
		-webkit-transition: width 0.25s ease-in-out;
		-moz-transition: width 0.25s ease-in-out;
		-o-transition: width 0.25s ease-in-out;
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
</style>

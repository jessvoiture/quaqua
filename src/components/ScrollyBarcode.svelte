<script>
	import Scrolly from './Scrolly.svelte';
	import { tweened } from 'svelte/motion';

	import { scaleLinear, scaleBand } from 'd3-scale';
	import { extent } from 'd3-array';

	export let flattenedArtists;
	export let screenHeight;
	export let screenWidth;

	let tweenedY;
	let tweenedX;

	const minReleaseDate = new Date(
		Math.min(...flattenedArtists.map((album) => new Date(album.album_release_date)))
	);
	const maxReleaseDate = new Date(
		Math.max(...flattenedArtists.map((album) => new Date(album.album_release_date)))
	);

	const steps = [
		`<p>step 0: x is album release date</p>`,
		'<p>step 1: x is days since debut</p>',
		'<p>step 2: y is sorted by diff to debut</p>'
	];

	const padding = 15;

	let data = flattenedArtists.map((album) => {
		const albumReleaseDate = new Date(album.album_release_date);

		// Calculate the difference in days between album_release_date and minReleaseDate
		const daysSinceMinReleaseDate = Math.floor(
			(albumReleaseDate - minReleaseDate) / (1000 * 60 * 60 * 24)
		);

		return {
			...album,
			days_since_min_release_date: daysSinceMinReleaseDate // New key-value pair
		};
	});

	let currentStep = 0;
	let stepWidth = 300;
	let previousDomain = [];

	let artistMaxDays = data.reduce((acc, item) => {
		if (!acc[item.artist]) {
			acc[item.artist] = item.days_since_first_release;
		} else {
			if (item.days_since_first_release > acc[item.artist]) {
				acc[item.artist] = item.days_since_first_release;
			}
		}
		return acc;
	}, {});

	let artistsSortedByDebutDate = data
		.map((item) => item.artist)
		.filter((value, index, self) => self.indexOf(value) === index)
		.sort((a, b) => {
			return a.first_album_release_date - b.first_album_release_date;
		});

	let artistsSortedByDaysActive = Object.keys(artistMaxDays).sort((a, b) => {
		return artistMaxDays[b] - artistMaxDays[a]; // Descending order
	});

	let artistNames = artistsSortedByDebutDate;

	$: width = 0.8 * screenWidth;
	$: height = 0.8 * screenHeight;
	$: innerWidth = width - 2 * padding;
	$: innerHeight = height - 2 * padding;

	$: tweenedX = tweened(data.map((d) => d.days_since_min_release_date));

	$: xExtent = extent($tweenedX);
	$: xScale = scaleLinear().domain(xExtent).range([0, innerWidth]);
	$: yScale = scaleBand().domain(artistNames).range([0, innerHeight]);

	$: if (currentStep == 0) {
		setReleaseDate();
	} else if (currentStep == 1) {
		setDiffToDebut();
	}

	const setDiffToDebut = function () {
		tweenedX.set(data.map((d) => d.days_since_first_release));
	};

	const setReleaseDate = function () {
		tweenedX.set(data.map((d) => d.days_since_min_release_date));
	};

	function updateYScale(newDomain) {
		const oldDomain = previousDomain;
		const interpolator = interpolate(oldDomain, newDomain);

		const scaleTween = tweened(oldDomain, {
			duration: 600,
			easing: quintOut
		});

		scaleTween.set(newDomain);

		scaleTween.subscribe((updatedDomain) => {
			yScale = scaleBand().domain(updatedDomain).range([0, innerHeight]).padding(0.1);
		});
	}
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height}>
			<g width={innerWidth} height={innerHeight} transform={`translate(${padding}, ${padding})`}>
				{#each data as d, i}
					<rect x={xScale($tweenedX[i])} y={yScale(d.artist)} width="1" height="12" />
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

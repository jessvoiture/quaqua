<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { writable } from 'svelte/store';

	import Scrolly from './Scrolly.svelte';
	import Tooltip from './Tooltip.svelte';
	import { hoveredData, mouseX, mouseY } from '../stores';
	import { scale } from 'svelte/transition';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	artists.sort((a, b) => {
		const maxA = Math.max(...a.albums.map((album) => album.days_since_first_release));
		const maxB = Math.max(...b.albums.map((album) => album.days_since_first_release));
		return maxB - maxA;
	});

	let width;
	let currentStep = 0;
	let areScalesFree = writable(false);
	let stepWidth = 300;
	let isHovering = false;

	let artistsDaysActive = artists.flatMap((artist) =>
		artist.albums.map((album) => album.days_since_first_release)
	);

	let extentDaysActive = extent(artistsDaysActive);

	let artistsDaysBetweenRelease = artists.flatMap((artist) =>
		artist.albums.map((album) => album.days_since_last_release)
	);

	let extentDaysBetweenRelease = extent(artistsDaysBetweenRelease);

	$: width = 0.9 * screenWidth;
	$: height = 0.95 * screenHeight;
	$: artistHeight = height / artists.length;

	$: xScale = scaleLinear()
		.domain(extentDaysActive)
		.range([0, width - 120]);

	$: yDomains = artists.map((artist) => {
		if ($areScalesFree) {
			const extentDaysBetweenRelease = extent(
				artists.flatMap((artist) => artist.albums.map((album) => album.days_since_last_release))
			);
			return extentDaysBetweenRelease;
		} else {
			const maxDaysSinceLastRelease = Math.max(
				...artist.albums.map((alb) => alb.days_since_last_release)
			);
			return [0, maxDaysSinceLastRelease];
		}
	});

	const handleMouseover = function (event, d) {
		hoveredData.set(d);
		console.log(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
		isHovering = true;
	};

	const handleMouseout = function () {
		hoveredData.set(undefined);
		isHovering = false;
	};

	const getYCoord = (album, yDomain) => {
		let yScale = scaleLinear()
			.domain(yDomain)
			.range([0, artistHeight - 4]);
		return yScale(album.days_since_last_release);
	};

	const steps = [
		// 0
		`<p>test step 1</p>`,
		// 1
		'<p>test step 2</p>'
	];
</script>

<label>
	Free Scales:
	<input type="checkbox" bind:checked={$areScalesFree} />
</label>

<div class="scroller">
	<div class="plot">
		<svg {width} {height}>
			<g>
				{#each artists as artist, i}
					<g {width} {artistHeight} class="artist" transform={`translate(0, ${i * artistHeight})`}>
						<text class="artist-label" transform={`translate(0, ${artistHeight / 2})`}
							>{artist.artist}</text
						>
						<g class="artist-albums" transform={`translate(120, 0)`}>
							<!-- svelte-ignore a11y-mouse-events-have-key-events -->
							<!-- svelte-ignore a11y-mouse-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							{#each artist.albums as album}
								<!-- svelte-ignore missing-declaration -->
								<polyline
									class="album"
									points="
                {xScale(album.days_since_first_release - album.days_since_last_release)},0
                {xScale(album.days_since_first_release)},{getYCoord(album, yDomains[i])} 
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

{#if ($hoveredData != undefined) & isHovering}
	<Tooltip {screenWidth} {screenHeight} type="album" />
{/if}

<style>
	text {
		font-size: 12px;
	}

	label {
		width: 100vw;
		text-align: left;
		display: block;
	}

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

	.artist:hover {
		background-color: lightgray;
	}
</style>

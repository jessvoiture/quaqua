<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { draw } from 'svelte/transition';

	import Scrolly from './Scrolly.svelte';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	let currentStep = 0;
	let stepWidth = 300;
	let linePath;

	const demoArtist = artists[37];
	const demoDebutAlbumDaysSinceRelease = demoArtist.albums[1].days_since_first_release;

	let maxViewBox = 0.5 * demoDebutAlbumDaysSinceRelease;

	const steps = [
		// 0
		`<p>showing debut release</p>`,
		// 1
		'<p>showing second release</p>'
	];

	let scale = scaleLinear().domain([0, demoDebutAlbumDaysSinceRelease]).range([0, 11.5]);

	console.log(demoDebutAlbumDaysSinceRelease);

	$: {
		if (currentStep == 0) {
			setDebutAlbum();
			maxViewBox = 0.5 * demoDebutAlbumDaysSinceRelease;
		} else if (currentStep == 1) {
			setSecondAlbum();
			maxViewBox = 1.25 * demoDebutAlbumDaysSinceRelease;
		}
	}

	const setDebutAlbum = function () {
		linePath = `M 0 0`;
	};

	const setSecondAlbum = function () {
		linePath = `M 0 0 l ${scale(demoDebutAlbumDaysSinceRelease)} ${scale(demoDebutAlbumDaysSinceRelease)} v-${scale(demoDebutAlbumDaysSinceRelease)}`;
	};

	const max = 12;
	let show = true;
</script>

<div class="scroller">
	<div class="plot">
		{#if currentStep == 1}
			<svg width={200} height={200} viewBox="0 0 12 12">
				<g transform="translate(0 12) scale(1 -1)">
					<path
						transition:draw={{ duration: 1500 }}
						d={linePath}
						fill="none"
						stroke="red"
						stroke-width="0.1px"
					/>
				</g>
			</svg>
		{/if}
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

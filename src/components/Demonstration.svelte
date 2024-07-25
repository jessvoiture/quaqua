<script>
	import { scaleLinear } from 'd3-scale';
	import { extent } from 'd3-array';
	import { draw } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { linear as easing } from 'svelte/easing';
	import { interpolateString } from 'd3-interpolate';

	import Scrolly from './Scrolly.svelte';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	let currentStep = 0;
	let stepWidth = 300;
	let activePath = 'M 0 0 l 0 0 v 0';

	let demoArtist = artists[37];
	let demoDebutAlbumDaysSinceRelease = demoArtist.albums[1].days_since_first_release;

	let linePath = tweened(null, {
		interpolate: interpolateString,
		duration: 1000,
		easing
	});

	$: linePath.set(activePath);
	$: console.log($linePath);

	const steps = [
		// 0
		`<p>showing debut release</p>`,
		// 1
		'<p>showing second release</p>'
	];

	let scale = scaleLinear().domain([0, demoDebutAlbumDaysSinceRelease]).range([0, 11.5]);

	$: {
		if (currentStep === 0) {
			setDebutAlbum();
		} else if (currentStep === 1) {
			setSecondAlbum();
		}
	}

	const setDebutAlbum = function () {
		activePath = 'M 0 0 l 0 0 v 0';
		linePath.set(activePath); // Update the linePath tweened store
	};

	const setSecondAlbum = function () {
		activePath = `M 0 0 l ${scale(demoDebutAlbumDaysSinceRelease)} ${scale(demoDebutAlbumDaysSinceRelease)} v-${scale(demoDebutAlbumDaysSinceRelease)}`;
		linePath.set(activePath); // Update the linePath tweened store
	};
</script>

<div class="scroller">
	<div class="plot">
		<svg width={200} height={200} viewBox="0 0 12 12">
			<g transform="translate(0 12) scale(1 -1)">
				{#if $linePath != null}
					<path d={$linePath} fill="none" stroke="red" stroke-width="0.1px" />
				{/if}
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

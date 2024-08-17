<script>
	import { draw, fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';

	import Scrolly from './Scrolly.svelte';
	import DrawPath from './DrawPath.svelte';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	// get adele's disco
	const demoArtist = artists.filter((a) => a.artist === 'Adele')[0];

	const steps = [
		// 0
		`<p>step 0: show nothing</p>`,
		// 1
		'<p>step 2: show debut to second</p>',
		// 2
		'<p>step 3: show TWO LINES</p>',
		// 3
		'<p>step 4: show THREE LINES</p>'
	];

	let width;
	let height;
	let maxGapDays;
	let viewboxWidth = tweened(10, { easing: quintOut, duration: 600 });
	let viewboxHeight = tweened(10, { easing: quintOut, duration: 600 });

	let currentStep = 0;
	let stepWidth = 300;
	let albumsShowing = demoArtist.albums.slice(0, 1);
	let firstLLine;
	let firstVLine;
	let secondLLine;
	let secondVLine;
	let thirdLine;

	$: width = 0.5 * screenWidth;
	$: height = 0.5 * screenHeight;

	$: {
		if (currentStep === 0) {
			setStep0();
		} else if (currentStep === 1) {
			setStep1();
		} else if (currentStep === 2) {
			setStep2();
		} else if (currentStep >= 3) {
			setStep3();
		}
	}

	function setStep0() {
		albumsShowing = demoArtist.albums.slice(0, 1);

		viewboxWidth.set(albumsShowing[0].days_since_first_release);
		viewboxHeight.set(albumsShowing[0].days_since_last_release);

		firstLLine = `M 0 0`;
	}

	function setStep1() {
		albumsShowing = demoArtist.albums.slice(0, 2);

		const maxGapDays = albumsShowing.reduce(
			(max, obj) => (obj.days_since_last_release > max ? obj.days_since_last_release : max),
			-Infinity
		);

		const daysSinceDebut = albumsShowing[1].days_since_first_release;
		const daysSinceLastRelease = albumsShowing[1].days_since_last_release;

		viewboxWidth.set(daysSinceDebut);
		viewboxHeight.set(maxGapDays);

		firstLLine = `M 0 0 l ${daysSinceDebut} ${daysSinceLastRelease}`;
		firstVLine = `M ${daysSinceDebut} ${daysSinceLastRelease} V 0`;
	}

	function setStep2() {
		albumsShowing = demoArtist.albums.slice(0, 3);

		const maxGapDays = albumsShowing.reduce(
			(max, obj) => (obj.days_since_last_release > max ? obj.days_since_last_release : max),
			-Infinity
		);

		const daysSinceDebut = albumsShowing[2].days_since_first_release;
		const daysSinceLastRelease = albumsShowing[2].days_since_last_release;

		viewboxWidth.set(daysSinceDebut + 3);
		viewboxHeight.set(maxGapDays);

		secondLLine = `M ${albumsShowing[1].days_since_first_release} 0 
			l ${daysSinceDebut - albumsShowing[1].days_since_first_release} ${daysSinceLastRelease}`;
		secondVLine = `M ${daysSinceDebut} ${daysSinceLastRelease} V 0`;
	}

	function setStep3() {
		albumsShowing = demoArtist.albums;

		const maxGapDays = albumsShowing.reduce(
			(max, obj) => (obj.days_since_last_release > max ? obj.days_since_last_release : max),
			-Infinity
		);

		const daysSinceDebut = albumsShowing[3].days_since_first_release;

		viewboxWidth.set(daysSinceDebut + 3);
		viewboxHeight.set(maxGapDays);

		thirdLine = `M ${albumsShowing[2].days_since_first_release} 0 
					l ${daysSinceDebut - albumsShowing[2].days_since_first_release} ${albumsShowing[3].days_since_last_release}
					V 0`;
	}
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height} viewBox="0 0 {$viewboxWidth} {$viewboxHeight}">
			<g>
				{#if currentStep >= 1}
					<DrawPath path={firstLLine} id="first-l-line" delayDur={0} />
					<DrawPath path={firstVLine} id="first-v-line" delayDur={1600} />
				{/if}

				{#if currentStep >= 2}
					<DrawPath path={secondLLine} id="second-l-line" delayDur={0} />
					<DrawPath path={secondVLine} id="second-v-line" delayDur={1600} />
				{/if}

				{#if currentStep >= 3}
					<DrawPath path={thirdLine} id="third-line" delayDur={0} />
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

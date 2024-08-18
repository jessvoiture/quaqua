<script>
	import { draw, fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';
	import { quintOut } from 'svelte/easing';

	import Scrolly from './Scrolly.svelte';
	import DrawPath from './DrawPath.svelte';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	// Get Rihanna's discography
	const demoArtist = artists.find((a) => a.artist === 'Rihanna');

	const steps = [
		`<p>step 0: show nothing</p>`,
		'<p>step 2: show debut to second</p>',
		'<p>step 3: show TWO LINES</p>',
		'<p>step 4: show THREE LINES</p>'
	];

	let width;
	let height;

	let firstLLine;
	let firstVLine;
	let secondLLine;
	let secondVLine;
	let thirdLine;

	let viewboxStartingWidth = 50;
	let viewboxStartingHeight = 50;
	let currentStep = 0;
	let stepWidth = 300;
	let viewboxWidth = tweened(viewboxStartingWidth, { easing: quintOut, duration: 600 });
	let viewboxHeight = tweened(viewboxStartingHeight, { easing: quintOut, duration: 600 });
	let albumsShowing = demoArtist.albums.slice(0, 1);
	let debutAlbumX = tweened(viewboxStartingWidth / 2, { easing: quintOut, duration: 600 });
	let debutAlbumY = tweened(viewboxStartingHeight / 2, { easing: quintOut, duration: 600 });

	$: width = 0.8 * screenWidth;
	$: height = 0.8 * screenHeight;

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

		viewboxWidth.set(viewboxStartingWidth);
		viewboxHeight.set(viewboxStartingHeight);
		debutAlbumX.set(viewboxStartingWidth / 2);
		debutAlbumY.set(viewboxStartingHeight / 2);

		firstLLine = `M 0 0`;
	}

	function setStep1() {
		albumsShowing = demoArtist.albums.slice(0, 2);

		const maxGapDays = Math.max(...albumsShowing.map((album) => album.days_since_last_release));
		const daysSinceDebut = albumsShowing[1].days_since_first_release;
		const daysSinceLastRelease = albumsShowing[1].days_since_last_release;

		viewboxWidth.set(daysSinceDebut + 3);
		viewboxHeight.set(maxGapDays);
		debutAlbumX.set(0);
		debutAlbumY.set(0);

		firstLLine = `M 0 0 l ${daysSinceDebut} ${daysSinceLastRelease}`;
		firstVLine = `M ${daysSinceDebut} ${daysSinceLastRelease} V 0`;
	}

	function setStep2() {
		albumsShowing = demoArtist.albums.slice(0, 3);

		const maxGapDays = Math.max(...albumsShowing.map((album) => album.days_since_last_release));
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
		const maxGapDays = Math.max(...albumsShowing.map((album) => album.days_since_last_release));
		const daysSinceDebut = albumsShowing[albumsShowing.length - 1].days_since_first_release;

		viewboxWidth.set(daysSinceDebut + 3, { duration: 1200 });
		viewboxHeight.set(maxGapDays);

		thirdLine = generatePath(albumsShowing);
	}

	function generatePath(albums) {
		if (albums.length < 2) return '';

		let path = `M ${albums[2].days_since_first_release} 0`;

		for (let i = 3; i < albums.length; i++) {
			const prevAlbum = albums[i - 1];
			const currentAlbum = albums[i];

			const x1 = prevAlbum.days_since_first_release;
			const y1 = prevAlbum.days_since_last_release;
			const x2 = currentAlbum.days_since_first_release;
			const y2 = currentAlbum.days_since_last_release;

			path += ` l ${x2 - x1} ${y2} V 0`;
		}
		return path;
	}
</script>

<div class="scroller">
	<div class="plot">
		<svg {width} {height} viewBox="0 0 {$viewboxWidth} {$viewboxHeight}">
			<g>
				{#if currentStep >= 0}
					<circle transition:fade cx={$debutAlbumX} cy={$debutAlbumY} r="5" />
				{/if}

				{#if currentStep >= 1}
					<DrawPath path={firstLLine} id="first-l-line" delayDur={0} dur={1500} />
					<DrawPath path={firstVLine} id="first-v-line" delayDur={1600} dur={1500} />

					{#each albumsShowing.slice(1) as a}
						<circle
							transition:fade={{ delay: 3000 }}
							cx={a.days_since_first_release}
							cy="0"
							r="5"
							fill="red"
						/>
					{/each}
				{/if}

				{#if currentStep >= 2}
					<DrawPath path={secondLLine} id="second-l-line" delayDur={0} dur={1500} />
					<DrawPath path={secondVLine} id="second-v-line" delayDur={1600} dur={1500} />
				{/if}

				{#if currentStep >= 3}
					<DrawPath
						path={thirdLine}
						id="third-line"
						delayDur={0}
						dur={albumsShowing.length * 800}
					/>
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

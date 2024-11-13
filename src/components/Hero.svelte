<script>
	import { isPlaying } from '../stores';

	export let screenHeight;
	export let screenWidth;

	let vinylSize = 1000;
	let topTranslate = 5;
	let leftTranslate = 5;

	$: if (screenWidth > 768) {
		vinylSize = 1.2 * screenHeight;
		topTranslate = -25;
		leftTranslate = -5;
	} else if ((screenWidth <= 768) & (screenWidth > 500)) {
		vinylSize = 1.3 * screenWidth;
		topTranslate = -10;
		leftTranslate = -30;
	} else if (screenWidth <= 500) {
		vinylSize = 1.8 * screenWidth;
		topTranslate = -20;
		leftTranslate = -45;
	}
</script>

<div class="hero">
	<div
		class="vinyl rotating"
		class:paused={!$isPlaying}
		style="width: {vinylSize}px; height: {vinylSize}px; top: calc({topTranslate}%); left: calc({leftTranslate}%);"
	>
		<div class="header">
			<!-- svelte-ignore a11y-missing-content -->
			<h1 aria-label="Album Drops" sr-only></h1>
			<img id="album-drops-title" src="/title.svg" alt="Album Drops" draggable="false" />

			<h2>An analysis of top selling artists' album drops</h2>
			<a href="https://jessvoiture.github.io/home/" target="_blank" class="detail" id="name"
				>by Jess Carr</a
			>
			<div class="detail" id="date">Oct 2024</div>
		</div>
		<div class="center-hole"></div>
	</div>
</div>

<style>
	.hero {
		min-height: 100vh;
		width: 100vw;
		position: relative;
		overflow: hidden;
		display: flex;
		background-color: #202020;
	}

	.vinyl {
		border-radius: 50%;
		background-color: #dad3c1;
		position: absolute;
	}

	.rotating {
		animation: spin 18s linear infinite;
	}

	.paused {
		animation-play-state: paused;
	}

	.header {
		background-color: #d63e30;
		position: absolute;
		border-radius: 50%;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 40%;
		height: 40%;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	#album-drops-title {
		width: 80%;
		height: 80%;
		transform: rotate(180deg);
	}

	h2 {
		font-weight: normal;
		color: #dad3c1;
		position: absolute;
		width: 50%;
		font-size: 12px;
		bottom: 70%;
		transform: rotate(180deg);
		line-height: 125%;
	}

	.detail {
		transform: rotate(180deg);
		font-size: 10px;
		color: #dad3c1;
		font-weight: normal;
		position: absolute;
		width: 30%;
	}

	#name {
		right: 5%;
	}

	#date {
		left: 5%;
	}

	text {
		font-family: Arial, sans-serif;
		font-stretch: 200%;
		font-size: 4rem;
		margin: 0;
		fill: #dad3c1;
		text-transform: uppercase;
	}

	.center-hole {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 3%;
		height: 3%;
		border-radius: 50%;
		background-color: #dad3c1;
	}

	@keyframes spin {
		0% {
			transform: rotate(150deg);
		}
		100% {
			transform: rotate(510deg);
		}
	}

	/* landscape */
	/* @media (min-aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-25%); 
			left: calc(-5%); 
		}
	} */

	/* portrait*/
	/* @media (max-aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-20%);
			left: calc(-45%);
		}
	} */

	/* Exact aspect ratio*/
	/* @media (aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-25%); 
			left: calc(-5%); 
		}
	} */
</style>

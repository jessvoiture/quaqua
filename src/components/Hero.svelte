<script>
	import { isPlaying } from '../stores';

	export let screenHeight;
	export let screenWidth;

	let vinylSize = 1000;

	$: isScreenLandscape = screenWidth > screenHeight;

	$: if (isScreenLandscape) {
		vinylSize = 1.2 * screenHeight;
	} else {
		vinylSize = 1.2 * screenWidth;
	}
</script>

<div class="hero">
	<div
		class="vinyl rotating"
		class:paused={!$isPlaying}
		style="width: {vinylSize}px; height: {vinylSize}px; "
	>
		<div class="header">
			<!-- svelte-ignore a11y-missing-content -->
			<h1 aria-label="Album Drops" sr-only></h1>
			<svg viewBox="0 0 600 600">
				<path id="curve" d="M300,100 A200,200 0 1,1 299.9,100" fill="none" stroke="none" />
				<text width="500" font-size="64">
					<textPath xlink:href="#curve" startOffset="50%" text-anchor="middle">
						Album Drops
					</textPath>
				</text>
			</svg>
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

	h2 {
		font-size: 1rem;
		font-weight: normal;
		color: #dad3c1;
		position: absolute;
		width: 50%;
		font-size: 14px;
		bottom: 70%;
		transform: rotate(180deg);
		line-height: 125%;
	}

	.detail {
		transform: rotate(180deg);
		font-size: 0.75rem;
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

	/* Minimum aspect ratio */
	@media (min-aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-25%); /* 10% of the vinyl is off the top */
			left: calc(-5%); /* 5% of the vinyl is off the left */
		}
	}

	/* Maximum aspect ratio */
	@media (max-aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-10%); /* 10% of the vinyl is off the top */
			left: calc(-25%); /* 5% of the vinyl is off the left */
		}
	}

	/* Exact aspect ratio, put it at the bottom to avoid override*/
	@media (aspect-ratio: 1/1) {
		.vinyl {
			top: calc(-10%); /* 10% of the vinyl is off the top */
			left: calc(-5%); /* 5% of the vinyl is off the left */
		}
	}
</style>

<script>
	import { isPlaying } from '../stores';
</script>

<div class="hero">
	<div class="vinyl rotating" class:paused={!$isPlaying}>
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
		width: 120vh;
		height: 120vh;
		position: absolute;
		top: -25%;
		left: -3%;
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
		font-size: 16px;
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
		font-size: 12px;
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
		font-size: 64px;
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
</style>

<script>
	import { isPlaying } from '../stores';

	export let screenHeight;
	export let screenWidth;
	export let y;

	let vinylSize = 500;
	let topTranslate = 5;
	let leftTranslate = 5;

	let todaysDate = new Date();
	$: formattedDate = todaysDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });

	$: if (screenWidth > 800) {
		vinylSize = 1.1 * screenHeight;
		topTranslate = -20;
		leftTranslate = -3;
	} else if ((screenWidth <= 800) & (screenWidth > 500)) {
		vinylSize = 1.1 * screenWidth;
		topTranslate = -10;
		leftTranslate = -20;
	} else if (screenWidth <= 500) {
		vinylSize = 1.4 * screenWidth;
		topTranslate = -10;
		leftTranslate = -35;
	}
</script>

<div class="hero">
	<div
		class="vinyl rotating"
		class:paused={!$isPlaying}
		style="width: {vinylSize}px; height: {vinylSize}px; top: calc({topTranslate}%); left: calc({leftTranslate}%);"
	>
		<div class="header">
			<h1 class="sr-only">Album Drops</h1>
			<img id="album-drops-title" src="/new_title.svg" alt="Album Drops" draggable="false" />

			<h2>An analysis of top selling artists' album drops</h2>
			<a
				href="https://jessvoiture.github.io/home/"
				target="_blank"
				class="detail"
				id="name"
				aria-label="Link to author's personal website">by Jess Carr</a
			>
			<div class="detail" id="date">{formattedDate}</div>
		</div>
		<div class="center-hole"></div>
	</div>

	<div class="scroll-reminder {y > 0 ? 'hidden' : ''}">
		<!-- <button> -->
		Play some music and scroll
		<i class="material-icons"> arrow_downward </i>
		<!-- </button> -->
	</div>
</div>

<style lang="scss">
	.hero {
		min-height: 100vh;
		width: 100vw;
		position: relative;
		overflow: hidden;
		display: flex;
		background-color: $color-black;
	}

	.scroll-reminder {
		background-color: $color-black;
		position: absolute;
		bottom: 104px;
		right: 44px;
		max-width: 150px;
		text-align: left;
		font-size: $type-size-16;
		color: #a7a294;
		padding: 4px 8px;
		border-radius: 4px;
	}

	.hidden {
		@include transition-opacity-to-zero;
	}

	.vinyl {
		border-radius: 50%;
		background-color: $color-white;
		position: absolute;
	}

	.rotating {
		animation: spin 18s linear infinite;
	}

	.paused {
		animation-play-state: paused;
	}

	.header {
		@include center-flex-vertically-and-horizontally;
		@include center-div-vertically-and-horizontally;
		background-color: $color-accent;
		border-radius: 50%;
		width: 45%;
		height: 45%;
	}

	#album-drops-title {
		width: 80%;
		height: 80%;
		transform: rotate(180deg);
	}

	h2 {
		font-weight: normal;
		color: $color-white;
		position: absolute;
		width: 50%;
		font-size: $type-size-14;
		bottom: 70%;
		transform: rotate(180deg);
		line-height: 125%;
	}

	.detail {
		transform: rotate(180deg);
		font-size: $type-size-12;
		color: $color-white;
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

	.center-hole {
		@include center-div-vertically-and-horizontally;
		width: 3%;
		height: 3%;
		border-radius: 50%;
		background-color: $color-white;
	}

	@keyframes spin {
		0% {
			transform: rotate(150deg);
		}
		100% {
			transform: rotate(510deg);
		}
	}

	@media (max-width: 800px) {
		h2 {
			font-size: $type-size-12;
			bottom: 60%;
		}

		.scroll-reminder {
			right: 16px;
			bottom: 112px;
		}
	}
</style>

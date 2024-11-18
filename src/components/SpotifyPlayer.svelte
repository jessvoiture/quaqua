<script>
	import { isPlaying } from '../stores';
	import { songUris } from '../lib/songs.js';
	import { onMount } from 'svelte';
	import { scaleLinear } from 'd3-scale';
	import { tweened } from 'svelte/motion';

	export let screenWidth;

	let EmbedController;
	let songIndex = 0;
	let timerTime = 30;
	let timerInterval;

	const timer = tweened(timerTime, { duration: 1000 });

	$: progressScale = scaleLinear().domain([0, timerTime]).range([0, screenWidth]);

	$: {
		if ($timer <= 0 && $isPlaying) {
			stopTimer();
			incrementCount();
			resetTimer();
		}
	}

	async function incrementCount() {
		if (songIndex < songUris.length - 1) {
			songIndex++;
		} else {
			songIndex = 0;
		}

		if (EmbedController) {
			EmbedController.loadUri(`spotify:track:${songUris[songIndex].uri}`);
			EmbedController.play();
			resetTimer();
			isPlaying.set(true);
		}
	}

	function startTimer() {
		if (timerInterval) {
			stopTimer();
		}

		timerInterval = setInterval(() => {
			timer.update((n) => {
				const newTime = Math.max(n - 1, 0);
				return newTime;
			});

			if ($timer <= 0) {
				stopTimer();
				incrementCount();
				resetTimer();
			}
		}, 1000);
	}

	function stopTimer() {
		if (timerInterval) {
			clearInterval(timerInterval);
			timerInterval = null;
		}
	}

	function resetTimer() {
		stopTimer();
		timer.set(timerTime, { duration: 0 });
		if ($isPlaying) {
			startTimer();
		}
	}

	// Handle play/pause toggle
	async function handlePlayPause() {
		if (EmbedController) {
			if ($isPlaying) {
				EmbedController.pause();
				stopTimer();
				isPlaying.set(false);
			} else {
				EmbedController.resume();
				isPlaying.set(true);
				startTimer();
			}
		}
	}

	// Handle skip button
	async function handleSkip() {
		incrementCount();
		resetTimer();
		isPlaying.set(true);
		startTimer();
	}

	// Load the Spotify IFrame API dynamically
	function loadSpotifyIframeApi() {
		if (window.onSpotifyIframeApiReady) {
			return; // Prevent loading the API again
		}

		const script = document.createElement('script');
		script.src = 'https://open.spotify.com/embed/iframe-api/v1';
		script.async = true;
		document.body.appendChild(script);

		script.onload = () => {
			window.onSpotifyIframeApiReady = (iframeApi) => {
				const element = document.getElementById('embed-iframe');
				const options = {
					width: '100%',
					height: '0',
					uri: `spotify:track:${songUris[songIndex].uri}`
				};

				iframeApi.createController(element, options, (controller) => {
					EmbedController = controller;
				});
			};
		};
	}

	// Load the API on component mount
	onMount(() => {
		loadSpotifyIframeApi();
	});
</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

<div class="music">
	<!-- Spotify Embed -->
	<div id="embed-iframe" style="display: none; visibility: hidden;"></div>

	<div class="playing-bar">
		<svg width={screenWidth} height={1}>
			<g class="time-elapsed">
				<rect x="0" y="0" width={progressScale(timerTime - $timer)} height="1" fill="#dad3c1" />
			</g>
		</svg>

		<div class="content">
			<img
				class="album-art"
				src={songUris[songIndex].image}
				alt="album cover art for {songUris[songIndex].song} by {songUris[songIndex].artist}"
			/>

			<div class="title-details">
				<div class="title-details-title">
					{songUris[songIndex].song}
				</div>
				<div class="title-details-artist">
					{songUris[songIndex].artist}
				</div>
			</div>

			<div class="music-controls">
				<!-- pause and play -->
				<button on:click={handlePlayPause} class="button-icon" aria-label="Toggle music play">
					<i class="material-icons" aria-hidden="true">
						{$isPlaying ? 'pause' : 'play_arrow'}
					</i>
				</button>

				<!-- skip song -->
				<button on:click={handleSkip} class="button-icon" aria-label="Skip to next song">
					<i class="material-icons" aria-hidden="true">skip_next</i>
				</button>

				<!-- spotify link -->
				<a
					href="https://open.spotify.com/playlist/2c4NBWpM0AX96R6uB5YEmg?si=3882570dedd04fd2"
					target="_blank"
					id="spotify-link"
					aria-label="Open playlist in Spotify"
				>
					<img
						class="button-img"
						id="spotify-logo-svg"
						src="/spotify.svg"
						alt=""
						aria-hidden="true"
						draggable="false"
					/>
				</a>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.music {
		position: fixed;
		bottom: 0px;
		width: 100%;
		max-width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
		background-color: $color-black;
		z-index: 10000000;
	}

	.playing-bar {
		border-top: 1px $color-dark_grey solid;
		box-sizing: border-box;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 0;
		padding: 0;
	}
	.content {
		background-color: #202020;
		box-sizing: border-box;
		padding: 8px 12px 8px 12px;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		min-width: 0;
		gap: 8px;
	}

	.music-controls {
		display: flex;
		flex-direction: row;
		gap: 2px;
		max-width: 126px;
	}

	#spotify-link {
		width: 40px;
		height: 40px;
		display: flex;
		border-radius: 50%;
		@include center-flex-vertically-and-horizontally;
	}

	#spotify-link:hover {
		background-color: #2b2b2b;
	}

	.button-img {
		width: 18px;
		height: 18px;
		vertical-align: middle;
	}

	.album-art {
		width: 40px;
		height: 40px;
	}

	.title-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
		overflow: hidden;
		flex: 1 1 auto !important;
	}

	.title-details-title {
		font-size: $type-size-12;
		color: $color-white;
		display: block;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title-details-artist {
		font-size: $type-size-10;
		color: #a7a294;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

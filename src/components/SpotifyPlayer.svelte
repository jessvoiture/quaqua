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

	function incrementCount() {
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
	function handlePlayPause() {
		if (EmbedController) {
			if ($isPlaying) {
				EmbedController.pause();
				stopTimer(); // Stop the timer when pausing
				isPlaying.set(false);
			} else {
				EmbedController.resume();
				isPlaying.set(true);
				startTimer(); // Restart the timer when playing
			}
		}
	}

	// Handle skip button (to move to the next song)
	function handleSkip() {
		incrementCount(); // Go to next song
		resetTimer(); // Reset the timer
		isPlaying.set(true); // Ensure playback continues
		startTimer(); // Start the timer again after skip
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
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="title-details-title">
					{songUris[songIndex].song}
				</div>
				<!-- svelte-ignore a11y-no-static-element-interactions -->
				<div class="title-details-artist">
					{songUris[songIndex].artist}
				</div>
			</div>

			<div class="music-controls">
				<!-- pause and play -->
				<button on:click={handlePlayPause}>
					<i class="material-icons">
						{$isPlaying ? 'pause' : 'play_arrow'}
					</i>
				</button>

				<!-- skip song -->
				<button on:click={handleSkip}>
					<i class="material-icons">skip_next</i>
				</button>

				<!-- spotify link -->
				<a
					href="https://open.spotify.com/playlist/2c4NBWpM0AX96R6uB5YEmg?si=3882570dedd04fd2"
					target="_blank"
				>
					<button>
						<img
							id="spotify-logo-svg"
							src="/spotify.svg"
							alt="Open playlist in spotify"
							draggable="false"
						/>
					</button>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.music {
		position: sticky;
		bottom: 0px;
		width: 100%;
		max-width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
	}

	.playing-bar {
		border-top: 1px #404040 solid;
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

	.material-icons {
		vertical-align: middle;
		font-size: 24px;
	}
	button {
		border: 1px solid #202020;
		color: #a7a294;
		background-color: #202020;
		cursor: pointer;
		border-radius: 100px;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	button:hover {
		background-color: #2b2b2b;
	}

	button:focus {
		background-color: #2b2b2b;
		border: 1px solid #a7a294;
	}

	button img {
		width: 20px;
		height: 20px;
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
		font-size: 12px;
		color: #dad3c1;
		display: block;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.title-details-artist {
		font-size: 10px;
		color: #a7a294;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
</style>

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
	let lastPlayAttempt = 0;
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
			await EmbedController.loadUri(`spotify:track:${songUris[songIndex].uri}`);

			// Add retry logic for mobile playback
			try {
				await playWithRetry();
			} catch (error) {
				console.error('Playback failed:', error);
			}

			resetTimer();
			isPlaying.set(true);
		}
	}

	async function playWithRetry(maxAttempts = 3) {
		const currentTime = Date.now();

		// If we've recently tried to play, wait a bit
		if (currentTime - lastPlayAttempt < 1000) {
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		lastPlayAttempt = currentTime;

		for (let attempt = 0; attempt < maxAttempts; attempt++) {
			try {
				await EmbedController.resume();
				// If play succeeds, break out of the retry loop
				return;
			} catch (error) {
				console.warn(`Play attempt ${attempt + 1} failed:`, error);
				if (attempt < maxAttempts - 1) {
					// Wait before next attempt, increasing delay each time
					await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
				} else {
					throw error; // Re-throw if all attempts fail
				}
			}
		}
	}

	// Modified handlePlayPause to use async/await
	async function handlePlayPause() {
		if (EmbedController) {
			if ($isPlaying) {
				await EmbedController.pause();
				stopTimer();
				isPlaying.set(false);
			} else {
				try {
					await playWithRetry();
					isPlaying.set(true);
					startTimer();
				} catch (error) {
					console.error('Failed to resume playback:', error);
					isPlaying.set(false);
				}
			}
		}
	}

	// Modified handleSkip to use async/await
	async function handleSkip() {
		await incrementCount();
		resetTimer();
		isPlaying.set(true);
		startTimer();
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

	function loadSpotifyIframeApi() {
		if (window.onSpotifyIframeApiReady) {
			return;
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
				<button on:click={handlePlayPause} class="button-icon">
					<i class="material-icons">
						{$isPlaying ? 'pause' : 'play_arrow'}
					</i>
				</button>

				<!-- skip song -->
				<button on:click={handleSkip} class="button-icon">
					<i class="material-icons">skip_next</i>
				</button>

				<!-- spotify link -->
				<a
					href="https://open.spotify.com/playlist/2c4NBWpM0AX96R6uB5YEmg?si=3882570dedd04fd2"
					target="_blank"
				>
					<button class="button-icon">
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

<style lang="scss">
	.music {
		position: sticky;
		bottom: 0px;
		width: 100%;
		max-width: 100%;
		overflow-x: hidden;
		overflow-y: hidden;
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

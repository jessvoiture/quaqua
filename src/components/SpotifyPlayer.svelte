<script>
	import { isPlaying } from '../stores';
	import { songUris } from '../lib/songs.js';
	import { onMount } from 'svelte';

	let EmbedController;
	let songIndex = 0;

	// Increment the song index and load the next song
	function incrementCount() {
		if (songIndex < songUris.length - 1) {
			songIndex++;
		} else {
			songIndex = 0;
		}

		if (EmbedController) {
			EmbedController.loadUri(`spotify:track:${songUris[songIndex].uri}`);
			EmbedController.togglePlay();

			if (!$isPlaying) {
				isPlaying.set(true);
			}
		}
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
					height: '0', // Hidden iframe
					uri: `spotify:track:${songUris[songIndex].uri}` // Load the first song
				};

				iframeApi.createController(element, options, (controller) => {
					EmbedController = controller;
				});
			};
		};
	}

	// Play/Pause functionality
	function handlePlayPause() {
		if (EmbedController) {
			EmbedController.togglePlay(); // Toggles between play and pause
			isPlaying.set(!$isPlaying); // Update the state
		}
	}

	// Load the API on component mount
	onMount(() => {
		loadSpotifyIframeApi();
	});
</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />

<!-- Spotify Embed -->
<div id="embed-iframe" style="display: none; visibility: hidden;"></div>
<!-- Hidden iframe -->

<div class="music-controls">
	<button on:click={handlePlayPause}>
		<i class="material-icons">
			{$isPlaying ? 'pause' : 'play_arrow'}
		</i>
	</button>

	<button on:click={incrementCount}>
		<i class="material-icons">skip_next</i>
	</button>

	<a
		href="https://open.spotify.com/playlist/2c4NBWpM0AX96R6uB5YEmg?si=3882570dedd04fd2"
		target="_blank"
	>
		<button>
			<img src="/spotify.svg" alt="Open playlist in spotify" />
		</button>
	</a>
</div>

<style>
	.music-controls {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	button {
		padding: 8px;
		border: 1px solid #202020;
		color: #202020;
		background-color: #dad3c1;
		cursor: pointer;
		border-radius: 100px;
		width: 44px;
		height: 44px;
	}

	button:hover {
		background-color: #bab6ab;
	}

	.material-icons {
		vertical-align: middle;
		font-size: 28px;
	}

	button img {
		width: 24px;
		height: 24px;
		vertical-align: middle;
	}
</style>

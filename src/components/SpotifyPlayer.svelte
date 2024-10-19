<script>
	import { isPlaying } from '../stores';
	import { onMount } from 'svelte';

	let EmbedController;
	let songIndex = 0;
	let songUris = ['1zHlj4dQ8ZAtrayhuDDmkY', '1DqdF42leyFIzqNDv9CjId']; // List of song URIs

	// Increment the song index and load the next song
	function incrementCount() {
		if (songIndex < songUris.length - 1) {
			songIndex++;
		} else {
			songIndex = 0;
		}

		if (EmbedController) {
			EmbedController.loadUri(`spotify:track:${songUris[songIndex]}`);
			EmbedController.togglePlay(); // Toggles between play and pause
		}
	}

	// Load the Spotify IFrame API dynamically (but only once)
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
					uri: `spotify:track:${songUris[songIndex]}` // Load the first song
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
		gap: 16px;
	}

	button {
		padding: 8px;
		border: none;
		color: #202020;
		background-color: #dad3c1;
		cursor: pointer;
		border-radius: 100px;
		width: 40px;
		height: 40px;
	}

	button:hover {
		background-color: #bab6ab;
	}

	.material-icons {
		vertical-align: middle;
		font-size: 24px;
	}

	button img {
		width: 20px;
		height: 20px;
		vertical-align: middle;
	}
</style>

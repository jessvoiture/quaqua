<script>
	import { isPlaying } from '../stores';
	import { songUris } from '../lib/songs.js';
	import { onMount } from 'svelte';

	let EmbedController;
	let songIndex = 0;

	console.log(songUris);

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
					height: '0',
					uri: `spotify:track:${songUris[songIndex].uri}`
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
			EmbedController.togglePlay();
			isPlaying.set(!$isPlaying);
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

<div class="playing-bar">
	<div class="title-and-album">
		<img
			class="album-art"
			src={songUris[songIndex].image}
			alt="album cover art for {songUris[songIndex].song} by {songUris[songIndex].artist}"
		/>

		<div class="title-details">
			<div class="title-details-title">{songUris[songIndex].song}</div>
			<div class="title-details-artist">{songUris[songIndex].artist}</div>
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
		<button on:click={incrementCount}>
			<i class="material-icons">skip_next</i>
		</button>

		<!-- spotify link -->
		<a
			href="https://open.spotify.com/playlist/2c4NBWpM0AX96R6uB5YEmg?si=3882570dedd04fd2"
			target="_blank"
		>
			<button>
				<img id="spotify-logo-svg" src="/spotify.svg" alt="Open playlist in spotify" />
			</button>
		</a>
	</div>
</div>

<style>
	.playing-bar {
		background-color: #202020;
		width: auto;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		position: sticky;
		padding: 6px;
		bottom: 0px;
		border-top: 1px #404040 solid;
	}

	.music-controls {
		display: flex;
		flex-direction: row;
		gap: 0px;
	}

	.material-icons {
		vertical-align: middle;
		font-size: 24px;
	}
	button {
		/* padding: 8px; */
		border: 1px solid #202020;
		color: #8a8987;
		background-color: #202020;
		cursor: pointer;
		border-radius: 100px;
		width: 40px;
		height: 40px;
	}

	button:hover {
		background-color: #2b2b2b;
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

	.title-and-album {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 8px;
	}

	.title-details {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.title-details-title {
		font-size: 12px;
		color: #dad3c1;
	}

	.title-details-artist {
		font-size: 10px;
		color: #8a8987;
	}
</style>

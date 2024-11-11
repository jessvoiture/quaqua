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

<div class="music">
	<!-- Spotify Embed -->
	<div id="embed-iframe" style="display: none; visibility: hidden;"></div>

	<div class="playing-bar">
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
		background-color: #202020;
		box-sizing: border-box;
		width: 100%;
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: space-between;
		padding: 6px;
		border-top: 1px #404040 solid;
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

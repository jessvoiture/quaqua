<script>
	import { hoveredData, mouseX, mouseY } from '../stores';

	export let screenWidth;
	export let screenHeight;
	export let type;

	const imgWidth = 100;
	const contentWidth = 200;
	const padding = 12;

	let adjustedMouseX;
	let adjustedMouseY;

	let tooltipWidth = imgWidth + contentWidth + 2 * padding;
	let tooltipHeight = 150;

	if ($mouseX + tooltipWidth + 50 < screenWidth) {
		adjustedMouseX = $mouseX + 10;
	} else {
		adjustedMouseX = $mouseX - tooltipWidth - 50;
	}

	if ($mouseY + tooltipHeight + 50 < screenHeight) {
		adjustedMouseY = $mouseY + 10;
	} else {
		adjustedMouseY = $mouseY - tooltipHeight;
	}

	function formatDaysToYears(days) {
		const years = Math.round((days / 365.25) * 10) / 10;
		return years;
	}

	function formatDate(dateString) {
		const date = new Date(dateString);
		const options = { day: '2-digit', month: 'short', year: 'numeric' };
		return date.toLocaleDateString('en-GB', options).replace(',', '');
	}
</script>

<div
	class="tooltip"
	style="left: {adjustedMouseX}px; 
          top: {adjustedMouseY}px;"
>
	{#if type == 'album'}
		<div class="tooltip-image">
			<img
				src={$hoveredData.album_image}
				alt="album cover of {$hoveredData.album}"
				loading="lazy"
			/>
		</div>
	{/if}

	<div class="tooltip-content">
		{#if type == 'artist'}
			<div class="header-main-title">{$hoveredData.artist}</div>
		{/if}

		{#if type == 'album'}
			<div class="header">
				<div class="header-main-title">{$hoveredData.album}</div>
				<div class="header-artist">by {$hoveredData.artist}</div>
			</div>

			<div class="tooltip-body">
				{#if $hoveredData.days_since_first_release == 0}
					<div class="tooltip-body-date">
						Debut album, released {formatDate($hoveredData.album_release_date)}
					</div>
				{:else}
					<div class="tooltip-body-date">
						Released {formatDate($hoveredData.album_release_date)}
					</div>
					<div class="tooltip-calcs">
						<div class="tooltip-body-text">
							{formatDaysToYears($hoveredData.days_since_first_release)} years since debut album
						</div>
						<div class="tooltip-body-text">
							{formatDaysToYears($hoveredData.days_since_last_release)} years since previous album
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style lang="scss" scoped>
	.tooltip {
		position: fixed;
		background-color: #404040;
		border: 1px solid #646464;
		border-radius: 8px;
		padding: 12px 16px;
		display: flex;
		flex-direction: row;
		gap: 16px;
		justify-content: start;
		align-items: flex-start;
		box-sizing: border-box;
	}

	img {
		width: 120px;
		height: auto;
	}

	.tooltip-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin: 0;
		padding: 0;
		width: 200px;
		font-size: 14px;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-main-title {
		font-size: 18px;
		color: #dad3c1;
		font-weight: bold;
		text-transform: capitalize;
	}

	.tooltip-body {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tooltip-body-date {
		color: #dad3c1;
		font-size: 14px;
		font-weight: bold;
	}

	.tooltip-body-text,
	.header-artist {
		color: #cac7be;
	}

	.tooltip-calcs {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
</style>

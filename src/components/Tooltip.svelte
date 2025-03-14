<script>
	import { differenceInYears, addYears, differenceInMonths } from 'date-fns';
	import { hoveredData, mouseX, mouseY } from '../stores';
	import Histogram from './ScrollyBarcode/Histogram.svelte';

	export let screenWidth;
	export let screenHeight;
	export let showingRelativeRelease;
	export let albumsSorted;

	const imgWidth = 150;
	const contentWidth = 200;
	const padding = 12;

	const tooltipWidthExcludingImage = contentWidth + 2 * padding;
	const tooltipWidth = imgWidth + tooltipWidthExcludingImage;
	const tooltipHeight = 150;

	let adjustedMouseX;
	let adjustedMouseY;

	if ($mouseX + tooltipWidth + 50 < screenWidth) {
		adjustedMouseX = $mouseX + 10;
	} else {
		adjustedMouseX = $mouseX - tooltipWidth - 50;
	}

	if ($mouseY + tooltipHeight + 150 < screenHeight) {
		adjustedMouseY = $mouseY + 10;
	} else {
		adjustedMouseY = $mouseY - tooltipHeight;
	}

	function formatDaysToYears(days) {
		const startDate = new Date(0);
		const endDate = addYears(startDate, days / 365.25);

		let years = differenceInYears(endDate, startDate);
		let remainingMonths = differenceInMonths(endDate, addYears(startDate, years));

		if (years < 1) {
			return `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
		}

		// Convert remaining months into a fraction of a year
		let fraction = remainingMonths / 12;
		let roundedYears = Math.round((years + fraction) * 2) / 2; // Round to nearest 0.5

		return `${roundedYears} year${roundedYears !== 1 ? 's' : ''}`;
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
	<div class="tooltip-image">
		<img src={$hoveredData.album_image} alt="album cover of {$hoveredData.album}" loading="lazy" />
	</div>

	<div class="tooltip-content">
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
				{#if showingRelativeRelease}
					<div class="tooltip-calcs">
						<div class="tooltip-body-text">
							{formatDaysToYears($hoveredData.days_since_first_release)} since debut album
						</div>
						<!-- <Histogram {albumsSorted} width={tooltipWidthExcludingImage} dataType={'since debut'} /> -->

						<div class="tooltip-body-text">
							{formatDaysToYears($hoveredData.days_since_last_release)} since previous album
						</div>
						<!-- <Histogram
							{albumsSorted}
							width={tooltipWidthExcludingImage}
							dataType={'since last album'}
						/> -->
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>

<style lang="scss">
	.tooltip {
		position: fixed;
		background-color: $color-white-white;
		border-radius: 0 8px 8px 0;
		padding: 0px;
		display: flex;
		justify-content: start;
		align-items: flex-start;
		box-sizing: border-box;
		border: 1px solid $color-dark_grey;
	}

	img {
		max-width: 200px;
		width: auto;
		height: 100%;
		display: block;
		// object-fit: cover;
	}

	.tooltip-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin: 0;
		padding: 12px;
		width: 200px;
		font-size: $type-size-14;
	}

	.header {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.header-main-title {
		font-size: $type-size-24;
		color: $color-black;
		text-transform: capitalize;
		font-weight: bold;
	}

	.tooltip-body {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.tooltip-body-date {
		color: $color-black;
		font-size: $type-size-14;
		font-weight: bold;
	}

	.tooltip-body-text,
	.header-artist {
		color: $color-black;
	}

	.tooltip-calcs {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	/* Minimum width */
	@media (min-width: 400px) {
		.tooltip {
			flex-direction: row;
		}
	}

	/* Maximum width */
	@media (max-width: 400px) {
		.tooltip {
			flex-direction: column;
		}
	}
</style>

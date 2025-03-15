<script>
	import { differenceInYears, addYears, differenceInMonths } from 'date-fns';
	import { hoveredData, mouseX, mouseY } from '../stores';
	// import Histogram from './ScrollyBarcode/Histogram.svelte';

	export let screenWidth;
	export let screenHeight;
	export let showingRelativeRelease;
	export let albumsSorted;

	$: isMobile = screenWidth < 800;
	let imgWidth = 150;
	let contentWidth = 250;
	let padding = 12;

	let tooltipWidthExcludingImage = contentWidth + 2 * padding;
	let tooltipWidth = imgWidth + tooltipWidthExcludingImage;
	let tooltipHeight = 150;
	let tooltipWidthMobile = 250;
	let tooltipHeightMobile = 400;

	$: tooltipWidthExcludingImage = contentWidth + 2 * padding;
	$: tooltipWidth = isMobile ? 0.9 * screenWidth : imgWidth + tooltipWidthExcludingImage;
	$: tooltipHeight = isMobile ? 0.9 * screenHeight : 150;
	$: padding = isMobile ? 24 : 12;

	let adjustedMouseX;
	let adjustedMouseY;

	// small screens <400: position center horizontally
	$: if (screenWidth <= 400) {
		adjustedMouseX = (screenWidth - tooltipWidthMobile) / 2;
		// smallish screens 400 - 800: position based on mouse position
		// see if tooltip will fit to the right of mouse pos based on screen width
	} else if (
		(screenWidth <= 800) &
		(screenWidth > 400) &
		($mouseX + tooltipWidthMobile + 50 < screenWidth) // within screen
	) {
		adjustedMouseX = $mouseX + 10;
		// translate tooltip by tooltipwidth if it will be off screen so it is to the left of mouse pos
	} else if (
		(screenWidth <= 800) &
		(screenWidth > 400) &
		($mouseX + tooltipWidthMobile + 50 > screenWidth) // extends off screen
	) {
		adjustedMouseX = $mouseX - tooltipWidthMobile + 10;
		// big screens > 800: position based on mouse position
		// check if extends off screen
	} else if ($mouseX + tooltipWidth + 50 < screenWidth) {
		adjustedMouseX = $mouseX + 10;
	} else {
		adjustedMouseX = $mouseX - tooltipWidth - 50;
	}

	// do the same for y position
	$: if (screenWidth < 400) {
		adjustedMouseY = (screenHeight - tooltipHeightMobile) / 2;
	} else if (
		(screenWidth < 800) &
		(screenWidth > 400) &
		($mouseY + tooltipHeightMobile + 75 > screenHeight) // extends off screen
	) {
		adjustedMouseY = $mouseY - tooltipHeightMobile / 1.25;
	} else if (
		(screenWidth < 800) &
		(screenWidth > 400) &
		($mouseY + tooltipHeightMobile + 50 < screenHeight) // on screen
	) {
		adjustedMouseY = $mouseY + 10;
	} else if ($mouseY + tooltipHeight + 50 < screenHeight) {
		adjustedMouseY = $mouseY + 10;
	} else {
		// off screen
		adjustedMouseY = $mouseY - tooltipHeight;
	}

	function formatDaysToYears(days) {
		if (days < 30) {
			return `${days} day${days !== 1 ? 's' : ''}`;
		}

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
			<div class="titles">
				<div class="header-main-title">{$hoveredData.album}</div>
				<div class="header-artist">by {$hoveredData.artist}</div>
			</div>
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

						<div class="tooltip-body-text">
							{formatDaysToYears($hoveredData.days_since_last_release)} since previous album
						</div>
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
		padding: 0px;
		display: flex;
		justify-content: start;
		align-items: flex-start;
		box-sizing: border-box;
		border: 1px solid $color-dark_grey;
		z-index: 1000 !important;
	}

	img {
		display: block;
	}

	.tooltip-content {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin: 0;
		padding: 12px;
		width: 250px;
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

	.header {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	/* Minimum width */
	@media (min-width: 800px) {
		.tooltip {
			flex-direction: row;
			border-radius: 0 8px 8px 0;
		}

		img {
			max-width: 250px;
			width: auto;
			height: 100%;
		}
	}

	/* Maximum width */
	@media (max-width: 800px) {
		.tooltip {
			flex-direction: column;
			height: auto;
			width: 250px;
			pointer-events: none;
			border-radius: 0 0px 8px 8px;
		}

		img {
			width: 250px;
			height: auto;
		}
	}
</style>

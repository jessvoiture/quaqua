<script>
	export let padding;
	export let height;
	export let xScale;
	export let currentStep;
	export let minReleaseDate;
	export let innerWidth;

	$: xTickCount = Math.floor(innerWidth / 200);
	$: xTicks = xScale.ticks(xTickCount);

	// Function to format a date as just the year (YYYY)
	function formatDate(date) {
		return date.getFullYear(); // Extracts the year from the date
	}

	// Function to convert ticks to formatted year strings
	function getFormattedDate(tick) {
		const newDate = new Date(minReleaseDate);
		newDate.setDate(minReleaseDate.getDate() + tick); // Add tick days to reference date
		return formatDate(newDate); // Format as YYYY
	}

	function getFormattedYears(tick) {
		const daysInYears = Math.round(tick / 365);
		return daysInYears;
	}
</script>

<g transform="translate({padding - 2}, -16)" class="axis xaxis">
	{#each xTicks as tick, i}
		<g transform="translate({xScale(tick)}, 0)">
			<text y={height} text-anchor={i == 0 ? 'start' : i == xTickCount - 1 ? 'end' : 'middle'}>
				{#if currentStep == 0}
					{getFormattedDate(tick)}
				{/if}

				{#if currentStep > 0}
					{getFormattedYears(tick)}
				{/if}
			</text>
		</g>
	{/each}
</g>

<style>
	text {
		font-size: 11px;
	}
</style>

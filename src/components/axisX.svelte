<script>
	import { fade } from 'svelte/transition';

	export let xScale;
	export let currentStep;
	export let minReleaseDate;
	export let innerWidth;
	export let innerHeight;

	let label;

	const textWidth = 200;

	$: if ((currentStep >= 1) & (currentStep < 4)) {
		label = 'Years Since Debut Album Released';
	} else if (currentStep >= 4) {
		label = 'Average Gap Between Albums (Years)';
	}

	$: xTickCount = Math.floor(innerWidth / 200);
	$: xTicks = xScale.ticks(xTickCount);

	// format a date as (YYYY)
	function formatDate(date) {
		return date.getFullYear();
	}

	// convert ticks to formatted year strings
	function getFormattedDate(tick) {
		const newDate = new Date(minReleaseDate);
		newDate.setDate(minReleaseDate.getDate() + tick);
		return formatDate(newDate); // format as YYYY
	}

	function getFormattedYears(tick) {
		const daysInYears = Math.round(tick / 365);
		return daysInYears;
	}
</script>

<g class="grid">
	<g class="xaxis axis" transform={`translate(0, ${innerHeight})`}>
		<!-- Axis numbers -->
		<g class="axis-numbers">
			{#each xTicks as tick, i}
				<g transform={`translate(${xScale(tick)}, 28)`}>
					<text text-anchor="middle">
						{#if currentStep == 0 || currentStep == undefined}
							{getFormattedDate(tick)}
						{/if}

						{#if currentStep > 0}
							{getFormattedYears(tick)}
						{/if}
					</text>
				</g>
			{/each}
		</g>

		{#if currentStep > 0}
			<text
				class="axis-label"
				transform={`translate(${innerWidth}, 48)`}
				text-anchor="end"
				alignment-baseline="middle"
				transition:fade
			>
				{label}
			</text>
		{/if}
	</g>

	<!-- Axis Lines -->
	<g class="lines">
		{#each xTicks as tick}
			<line x1={xScale(tick)} y1="0" x2={xScale(tick)} y2={innerHeight} stroke="#e3e3e3" />
		{/each}
	</g>
</g>

<style>
	text {
		font-size: 12px;
	}

	.axis-label {
		font-size: 14px;
	}
</style>

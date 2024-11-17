<script>
	import { fade } from 'svelte/transition';
	import { tweened } from 'svelte/motion';

	export let xScale;
	export let currentStep;
	export let minReleaseDate;
	export let innerWidth;
	export let innerHeight;
	export let rectHeight;

	const daysInYear = 365.25;

	const axisTicks = [
		{ releaseDate: 5051, daysActive: 10 * daysInYear, eraLength: 1 * daysInYear },
		{ releaseDate: 12356, daysActive: 20 * daysInYear, eraLength: 2 * daysInYear },
		{ releaseDate: 19661, daysActive: 30 * daysInYear, eraLength: 3 * daysInYear },
		{ releaseDate: 26966, daysActive: 40 * daysInYear, eraLength: 4 * daysInYear },
		{ releaseDate: 26966, daysActive: 50 * daysInYear, eraLength: 5 * daysInYear }
	];

	let axisLabel;
	let tweenedTicks;

	$: tweenedTicks = tweened(axisTicks.map((d) => d.releaseDate));

	$: if (currentStep == 0) {
		axisLabel = 'Album Release Date';
		setTicksToReleaseDate();
	} else if (currentStep >= 1) {
		axisLabel = 'Years Since Debut Album Was Released';
		setTicksToDaysActive();
	}

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

	const setTicksToReleaseDate = () => {
		tweenedTicks.set(axisTicks.map((d) => d.releaseDate));
	};

	const setTicksToDaysActive = () => {
		tweenedTicks.set(axisTicks.map((d) => d.daysActive));
	};
</script>

<g class="grid">
	<g class="xaxis axis" transform={`translate(0, ${innerHeight})`}>
		<!-- Axis numbers -->
		<g class="axis-ticks">
			{#each axisTicks as tick, i}
				<g transform={`translate(${xScale($tweenedTicks[i])}, 28)`}>
					<text text-anchor="middle">
						{#if currentStep == 0 || currentStep == undefined}
							{getFormattedDate($tweenedTicks[i])}
						{/if}

						{#if currentStep > 0}
							{getFormattedYears($tweenedTicks[i])}
						{/if}
					</text>
				</g>
			{/each}
		</g>

		<text
			class="axis-label"
			transform={`translate(${innerWidth}, 48)`}
			text-anchor="end"
			alignment-baseline="middle"
			transition:fade
		>
			{axisLabel}
		</text>
	</g>

	<!-- Axis Lines -->
	<g class="lines">
		{#each axisTicks as tick, i}
			<line
				x1={xScale($tweenedTicks[i])}
				y1="0"
				x2={xScale($tweenedTicks[i])}
				y2={innerHeight + rectHeight}
				stroke="#404040"
				pointer-events="none"
			/>
		{/each}
	</g>
</g>

<style lang="scss">
	.axis-label {
		font-size: $type-size-14;
	}

	text {
		font-size: $type-size-10;
	}
</style>

<script>
	export let artistsSorted;
	export let yScale;
	export let xScale;
	export let tweenedNames;
	export let tweenedBarWidth;
	export let rectHeight;
	export let highlightedGroup;
</script>

<g class="bars">
	{#each artistsSorted as d, i}
		<rect
			class={'first-width-transition'}
			class:highlightedBar={highlightedGroup.includes(d.artist)}
			x="0"
			y={yScale($tweenedNames[i])}
			width={xScale($tweenedBarWidth[i])}
			height={rectHeight}
			fill="#dad3c1"
			aria-label="Data point for the {artistsSorted[i]}"
		/>
	{/each}
</g>

<style lang="scss">
	.first-width-transition {
		transition: width 0.1s ease-out;
		-webkit-transition: width 0.1s ease-out;
		-moz-transition: width 0.1s ease-out;
		-o-transition: width 0.1s ease-out;
	}

	.highlightedBar {
		fill: $color-accent;
		@include transition-fill;
	}
</style>

<script>
	export let artistsSorted;
	export let yScale;
	export let xScale;
	export let tweenedNames;
	export let tweenedBarWidth;
	export let rectHeight;
</script>

<g class="bars">
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	{#each artistsSorted as d, i}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<rect
			class={'first-width-transition'}
			x="0"
			y={yScale($tweenedNames[i])}
			width={xScale($tweenedBarWidth[i])}
			height={rectHeight}
			fill="#dad3c1"
			aria-label="Data point for the {artistsSorted[i]}"
		/>
	{/each}
</g>

<style>
	.first-width-transition {
		transition: width 0.1s ease-out;
		-webkit-transition: width 0.1s ease-out;
		-moz-transition: width 0.1s ease-out;
		-o-transition: width 0.1s ease-out;
	}
</style>

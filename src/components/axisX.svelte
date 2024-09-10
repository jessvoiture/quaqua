<script>
	export let padding;
	export let xTicks;
	export let height;
	export let xScale;
	export let xTickCount;
</script>

<g transform="translate({padding}, -6)" class="axis xaxis">
	{#each xTicks as tick, i}
		<g transform="translate({xScale(tick)}, 0)">
			<text y={height} text-anchor={i == 0 ? 'start' : i == xTickCount - 1 ? 'end' : 'middle'}
				>{tick}</text
			>
		</g>
	{/each}
</g>

<style>
	text {
		font-size: 11px;
	}
</style>

<script>
	import { hoveredData, hoveredLabelRow, isDataHovered } from '../../stores';

	export let artistsSorted;
	export let yScale;
	export let tweenedNames;
	export let width;
	export let rectHeight;

	const handleMouseoverLabel = function (d) {
		hoveredLabelRow.set(d);
	};

	const handleMouseoutLabel = function (d) {
		hoveredLabelRow.set(undefined);
	};
</script>

<g class="artist-labels axis yaxis">
	{#each artistsSorted as a, i}
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<!-- svelte-ignore a11y-mouse-events-have-key-events -->
		<g>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<rect
				class={a.artist}
				x="0"
				y={yScale($tweenedNames[i]) - 2}
				{width}
				height={rectHeight + 4}
				fill="#323232"
				opacity={a == $hoveredLabelRow
					? 100
					: $isDataHovered
						? a.artist == $hoveredData.artist
							? 100
							: 0
						: 0}
				rx="4"
				ry="4"
				aria-label="Row for {artistsSorted[i]}"
				on:mouseover={function () {
					handleMouseoverLabel(a);
				}}
				on:mouseout={function () {
					handleMouseoutLabel();
				}}
			/>

			<text
				x="8"
				y={yScale($tweenedNames[i]) + rectHeight / 1.1}
				height={rectHeight}
				class="artist-label"
				aria-label={artistsSorted[i]}>{a.artist}</text
			>
		</g>
	{/each}
</g>

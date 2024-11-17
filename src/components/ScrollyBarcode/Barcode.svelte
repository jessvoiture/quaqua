<script>
	import { hoveredData, mouseX, mouseY, isDataHovered } from '../../stores';

	export let albumsSorted;
	export let xScale;
	export let yScale;
	export let rectTouchAreaSize;
	export let tweenedX;
	export let tweenedY;
	export let colourClass;
	export let rectHeight;
	export let rectWidth;

	const handleMouseover = function (event, d) {
		hoveredData.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
		isDataHovered.set(true);
	};

	const handleMouseout = function () {
		hoveredData.set(undefined);
		isDataHovered.set(false);
	};
</script>

<g class="barcode">
	<!-- svelte-ignore a11y-mouse-events-have-key-events -->
	{#each albumsSorted as d, i}
		<g>
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- invisible rectangles fo touch area -->
			<rect
				x={xScale($tweenedX[i]) - rectTouchAreaSize / 2}
				y={yScale($tweenedY[i]) - rectTouchAreaSize / 4}
				width={rectTouchAreaSize}
				height={rectTouchAreaSize}
				fill="transparent"
				pointer-events="all"
				on:mouseover={function (event) {
					handleMouseover(event, d);
				}}
				on:mouseout={function () {
					handleMouseout();
				}}
			/>

			<!-- visilbe rectangles plotting albums -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<rect
				x={xScale($tweenedX[i])}
				y={$isDataHovered && $hoveredData?.album == d.album
					? yScale($tweenedY[i]) - 0.25 * rectHeight
					: yScale($tweenedY[i])}
				width={$isDataHovered && $hoveredData?.album == d.album ? rectWidth * 2 : rectWidth}
				height={$isDataHovered && $hoveredData?.album == d.album ? rectHeight * 1.5 : rectHeight}
				class={colourClass}
				pointer-events="all"
				aria-label="Data point for the album, {d.album} by {d.artist}."
				on:mouseover={function (event) {
					handleMouseover(event, d);
				}}
				on:mouseout={function () {
					handleMouseout();
				}}
			/>
		</g>
	{/each}
</g>

<style lang="scss">
	.full-opacity {
		opacity: 1;
	}

	.white {
		fill: $color-white;
	}

	.black {
		fill: $color-black;
		@include transition-fill;
	}
</style>

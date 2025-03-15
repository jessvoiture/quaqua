<script>
	import { hoveredData, mouseX, mouseY, isDataHovered } from '../../stores';

	export let albumsSorted;
	export let xScale;
	export let yScale;
	export let rectTouchAreaSize;
	export let tweenedX;
	export let tweenedY;
	export let tweenedSizeWidth;
	export let tweenedSizeHeight;
	export let colourClass;
	export let highlightedAlbums;
	export let borderRadius;
	export let isCircle;
	export let rectHeight;

	const handleMouseover = function (event, d) {
		hoveredData.set(d);
		mouseX.set(event.clientX);
		mouseY.set(event.clientY);
		isDataHovered.set(true);
		console.log('clicked');
	};

	const handleFocus = function (event, d) {
		const rect = event.target.getBoundingClientRect();
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;
		hoveredData.set(d);
		mouseX.set(centerX);
		mouseY.set(centerY);
		isDataHovered.set(true);
	};

	const handleMouseout = function () {
		console.log('off');
		hoveredData.set(undefined);
		isDataHovered.set(false);
	};
</script>

<g class="barcode">
	{#each albumsSorted as d, i}
		<g>
			<!-- invisible rectangles fo touch area -->
			<!-- svelte-ignore a11y-no-static-element-interactions -->
			<!-- svelte-ignore a11y-mouse-events-have-key-events -->
			<rect
				x={xScale($tweenedX[i]) - rectTouchAreaSize / 2}
				y={yScale($tweenedY[i]) - rectTouchAreaSize / 4}
				width={rectTouchAreaSize}
				height={rectTouchAreaSize}
				fill="transparent"
				pointer-events="all"
				aria-label={`touch area for ${d.Album}`}
				on:mouseover={function (event) {
					handleMouseover(event, d);
				}}
				on:mouseout={function () {
					handleMouseout();
				}}
			/>

			<!-- visilbe rectangles plotting albums -->
			<rect
				x={xScale($tweenedX[i])}
				y={$isDataHovered && $hoveredData?.album == d.album
					? yScale($tweenedY[i]) - 0.5 * $tweenedSizeHeight[i]
					: isCircle
						? yScale($tweenedY[i]) - 0.5 * $tweenedSizeHeight[i] - 0.5 * rectHeight + rectHeight
						: yScale($tweenedY[i])}
				width={$isDataHovered && $hoveredData?.album == d.album
					? $tweenedSizeWidth[i] * 2
					: $tweenedSizeWidth[i]}
				height={$isDataHovered && $hoveredData?.album == d.album
					? $tweenedSizeHeight[i] * 2
					: $tweenedSizeHeight[i]}
				class={highlightedAlbums.some((a) => a.album === d.album) ? 'red' : colourClass}
				rx={borderRadius}
				ry={borderRadius}
				pointer-events="all"
				role="button"
				tabindex="0"
				aria-label="Data point for the album, {d.album} by {d.artist}."
				on:mouseover={function (event) {
					handleMouseover(event, d);
				}}
				on:mouseout={function () {
					handleMouseout();
				}}
				on:focus={function (event) {
					handleFocus(event, d);
				}}
				on:blur={function () {
					handleMouseout();
				}}
			/>
		</g>
	{/each}
</g>

<style lang="scss">
	.white {
		fill: $color-white;
	}

	.red {
		fill: red;
	}

	.black {
		fill: $color-black;
		@include transition-fill-with-1s-delay;
	}
</style>

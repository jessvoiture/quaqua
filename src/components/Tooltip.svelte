<script>
	import { hoveredDatapoint, mouseX, mouseY } from '../stores';

	export let screenWidth;
	export let screenHeight;

	let adjustedMouseX;
	let adjustedMouseY;

	let tooltipWidth = 200;
	let tooltipHeight = 150;

	if ($mouseX + tooltipWidth + 50 < screenWidth) {
		adjustedMouseX = $mouseX + 10;
	} else {
		adjustedMouseX = $mouseX - tooltipWidth - 50;
	}

	if ($mouseY + tooltipHeight + 50 < screenHeight) {
		adjustedMouseY = $mouseY + 10;
	} else {
		adjustedMouseY = $mouseY - tooltipHeight;
	}
</script>

<div
	class="tooltip"
	style="left: {adjustedMouseX}px; 
          top: {adjustedMouseY}px;
          width: {tooltipWidth}px;"
>
	<div class="tooltip-content body-text">
		<p>{$hoveredDatapoint.album}</p>
		<p>
			{$hoveredDatapoint.album_release_date}
		</p>
		<p>
			{#if $hoveredDatapoint.days_since_first_release == 0}
				Debut album
			{:else}
				{Math.round(($hoveredDatapoint.days_since_first_release / 365.25) * 10) / 10} years since debut
				album
				{Math.round(($hoveredDatapoint.days_since_last_release / 365.25) * 10) / 10} years since previous
				album
			{/if}
		</p>
	</div>
</div>

<style lang="scss" scoped>
	.tooltip {
		position: fixed;
		background-color: white;
		border: 1px solid #ccc;
		border-radius: 8px;
		padding: 16px;
	}

	.tooltip-content p {
		margin: 0;
		padding: 0;
		color: #6b5b6a;
	}
</style>

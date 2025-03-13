<script>
	import { scaleLinear } from 'd3-scale';
	import { extent, max, histogram } from 'd3-array';

	export let albumsSorted;
	export let width;
	export let dataType;

	let chartWidth = width - 30;
	let height = 50;

	let data = albumsSorted;
	let tickCount = 40;
	let xTicks = [];

	if (dataType === 'since debut') {
		const albumsExcludingDebuts = albumsSorted.filter((d) => d.days_since_first_release != 0);
		data = albumsExcludingDebuts.map((d) => d.days_since_first_release / 365.25);
		// tickCount = 50;
		xTicks = [0, 25, 50];
	} else if (dataType === 'since last album') {
		const albumsExcludingDebuts = albumsSorted.filter((d) => d.days_since_first_release != 0);
		data = albumsExcludingDebuts.map((d) => d.days_since_last_release / 365.25);
		// tickCount = 40;
		xTicks = [0, 20, 40];
	}

	// scales
	let xExtent = extent(data);

	let xScale = scaleLinear().domain(xExtent).range([0, chartWidth]);

	const binGenerator = histogram().domain(xScale.domain()).thresholds(xScale.ticks(50));

	const bins = binGenerator(data);

	// Y-axis scale
	const yScale = scaleLinear()
		.domain([0, max(bins, (d) => d.length)]) // Max bin count
		.nice()
		.range([height, 0]);

	const barWidth = chartWidth / bins.length;

	console.log(bins);
</script>

<svg {chartWidth} {height}>
	<!-- Histogram Bars -->
	<g class="histogram">
		{#each bins as bin}
			<rect
				x={xScale(bin.x0)}
				y={yScale(bin.length)}
				width={barWidth - 2}
				height={height - yScale(bin.length)}
				fill="#cac7be"
			/>
		{/each}
	</g>

	<g class="histogram-x-axis xaxis axis" transform={`translate(0, ${height})`}>
		{#each xTicks as tick}
			<text x={xScale(tick)} y="15" text-anchor="middle" font-size="12">
				{tick}
			</text>
		{/each}
	</g>
</svg>

<script>
	import { draw, fade } from 'svelte/transition';

	export let path;
	export let id;
	export let delayDur;
</script>

<path
	transition:draw={{ duration: 1500, delay: delayDur }}
	class="line"
	{id}
	d={path}
	fill="none"
	stroke="red"
	stroke-width="3px"
/>

<script>
	import { draw, fade } from 'svelte/transition';

	export let path;
	export let id;
	export let delayDur;
	export let dur;
</script>

<path
	in:draw={{ duration: dur, delay: delayDur }}
	out:fade
	class="line"
	{id}
	d={path}
	fill="none"
	stroke="red"
	stroke-width="1.5px"
	stroke-linecap="round"
/>

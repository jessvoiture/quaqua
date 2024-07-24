<script>
	import Scrolly from './Scrolly.svelte';

	export let artists;
	export let screenHeight;
	export let screenWidth;

	let currentStep = 0;
	let stepWidth = 300;

	const steps = [
		// 0
		`<p>test step 1</p>`,
		// 1
		'<p>test step 2</p>'
	];
</script>

<div class="scroller">
	<div class="plot"></div>

	<div class="steps-wrapper">
		<Scrolly bind:value={currentStep}>
			{#each steps as text, i}
				<div class="step" class:active={currentStep === i}>
					<div class="step-content" width={stepWidth}>
						{@html text}
					</div>
				</div>
			{/each}
		</Scrolly>
	</div>
</div>

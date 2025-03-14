<script>
	export let hasHeader;
	export let header;
	export let content = [];
</script>

<div class="paragraph-wrapper">
	<div class="paragraph">
		{#if hasHeader}
			<h4>{header}</h4>
		{/if}
		{#each content as c}
			<p>{c}</p>
		{/each}
	</div>
</div>

<style lang="scss">
	.paragraph-wrapper {
		display: flex;
		justify-content: center;
		width: 100%;
	}

	.paragraph {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}

	p {
		margin: 0;
		@include body-text;
	}
</style>

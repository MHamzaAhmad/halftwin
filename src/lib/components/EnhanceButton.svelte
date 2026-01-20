<script lang="ts">
	interface Props {
		onclick: () => void;
		loading?: boolean;
		disabled?: boolean;
	}

	let { onclick, loading = false, disabled = false }: Props = $props();
</script>

<button
	type="button"
	class="btn-primary relative flex w-full min-w-[200px] items-center justify-center gap-2 px-6 py-3 sm:w-auto"
	{onclick}
	disabled={disabled || loading}
>
	{#if loading}
		<svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
			<path
				class="opacity-75"
				fill="currentColor"
				d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
			/>
		</svg>
		<span>Enhancing...</span>
	{:else}
		<span>Make Me Better</span>
	{/if}
</button>

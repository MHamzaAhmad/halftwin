<script lang="ts">
	let { variant = 'default' }: { variant?: 'default' | 'compact' } = $props();
</script>

{#if variant === 'compact'}
	<div class="mx-auto flex max-w-sm flex-col items-center gap-2 text-center">
		<div class="flex items-center gap-1.5 text-xs font-medium text-text-tertiary">
			<svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			<span>Private & Secure</span>
		</div>
		<p class="text-[10px] leading-relaxed text-balance text-text-tertiary sm:text-xs">
			We don't store any data or images. Your photo is sent securely to Google AI only to be
			enhanced and returned directly to you.
		</p>
	</div>
{:else}
	<div class="mx-auto mt-12 max-w-md border-t border-border pt-8 text-center">
		<div class="mb-2 flex items-center justify-center gap-2 font-medium text-text-primary">
			<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
				/>
			</svg>
			<h3>Privacy First</h3>
		</div>
		<p class="text-sm text-text-secondary">Photos are processed securely and never stored.</p>
	</div>
{/if}

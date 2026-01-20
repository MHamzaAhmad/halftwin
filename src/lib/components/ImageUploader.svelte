<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		onImageSelect: (file: File, base64: string) => void;
		disabled?: boolean;
	}

	let { onImageSelect, disabled = false }: Props = $props();

	let dragOver = $state(false);
	let previewUrl = $state<string | null>(null);
	let fileInput: HTMLInputElement;

	onMount(() => {
		// Listen for paste events on the document
		const handlePaste = (e: ClipboardEvent) => {
			if (disabled) return;

			const items = e.clipboardData?.items;
			if (!items) return;

			for (const item of items) {
				if (item.type.startsWith('image/')) {
					const file = item.getAsFile();
					if (file) {
						e.preventDefault();
						processFile(file);
						break;
					}
				}
			}
		};

		document.addEventListener('paste', handlePaste);
		return () => document.removeEventListener('paste', handlePaste);
	});

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		if (!disabled) dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (disabled) return;

		const file = e.dataTransfer?.files[0];
		if (file && file.type.startsWith('image/')) {
			processFile(file);
		}
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		const file = target.files?.[0];
		if (file) {
			processFile(file);
		}
	}

	function processFile(file: File) {
		if (file.size > 10 * 1024 * 1024) {
			alert('Image too large! Please select an image under 10MB.');
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const base64Full = reader.result as string;
			previewUrl = base64Full;
			const base64Data = base64Full.split(',')[1];
			onImageSelect(file, base64Data);
		};
		reader.readAsDataURL(file);
	}

	function clearImage() {
		previewUrl = null;
		if (fileInput) fileInput.value = '';
	}

	export { clearImage };
</script>

<div
	class="upload-zone group relative mx-auto aspect-[4/3] w-full max-w-lg cursor-pointer overflow-hidden"
	class:border-blue-500={dragOver}
	class:bg-blue-50={dragOver}
	class:opacity-50={disabled}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="button"
	tabindex="0"
	onclick={() => !disabled && fileInput?.click()}
	onkeydown={(e) => e.key === 'Enter' && !disabled && fileInput?.click()}
>
	<input
		bind:this={fileInput}
		type="file"
		accept="image/*"
		class="hidden"
		onchange={handleFileSelect}
		{disabled}
	/>

	{#if previewUrl}
		<img
			src={previewUrl}
			alt="Your selfie"
			class="absolute inset-0 h-full w-full object-contain p-4"
		/>
		{#if !disabled}
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					clearImage();
				}}
				aria-label="Remove image"
				class="absolute top-4 right-4 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
			>
				<svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		{/if}
	{:else}
		<div
			class="absolute inset-0 flex flex-col items-center justify-center text-stone-400 transition-colors group-hover:text-stone-800"
		>
			<div
				class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 transition-colors group-hover:bg-stone-200"
			>
				<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="1.5"
						d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
					/>
				</svg>
			</div>
			<p class="font-medium text-stone-600">Upload a photo</p>
			<p class="mt-2 text-xs">Drag, click, or paste (Ctrl+V)</p>
		</div>
	{/if}
</div>

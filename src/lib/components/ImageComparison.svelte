<script lang="ts">
	interface Props {
		beforeSrc: string;
		afterSrc: string;
	}

	let { beforeSrc, afterSrc }: Props = $props();

	let sliderPosition = $state(50);
	let containerRef: HTMLDivElement;
	let isDragging = $state(false);

	function updateSliderPosition(clientX: number) {
		if (!containerRef) return;
		const rect = containerRef.getBoundingClientRect();
		const x = clientX - rect.left;
		const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
		sliderPosition = percentage;
	}

	function handleMouseDown(e: MouseEvent) {
		isDragging = true;
		updateSliderPosition(e.clientX);
	}

	function handleMouseMove(e: MouseEvent) {
		if (isDragging) {
			updateSliderPosition(e.clientX);
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleTouchStart(e: TouchEvent) {
		isDragging = true;
		updateSliderPosition(e.touches[0].clientX);
	}

	function handleTouchMove(e: TouchEvent) {
		if (isDragging) {
			e.preventDefault();
			updateSliderPosition(e.touches[0].clientX);
		}
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} ontouchend={handleMouseUp} />

<div
	bind:this={containerRef}
	class="glass-card animate-fade-in relative aspect-square max-h-96 w-full cursor-ew-resize touch-none overflow-hidden rounded-2xl select-none"
	onmousedown={handleMouseDown}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	role="slider"
	aria-valuenow={sliderPosition}
	aria-valuemin={0}
	aria-valuemax={100}
	tabindex="0"
>
	<!-- After Image (Full) -->
	<img
		src={afterSrc}
		alt="Enhanced version"
		class="absolute inset-0 h-full w-full object-contain"
	/>

	<!-- Before Image (Clipped) -->
	<div
		class="absolute inset-0 overflow-hidden"
		style="clip-path: inset(0 {100 - sliderPosition}% 0 0)"
	>
		<img
			src={beforeSrc}
			alt="Original version"
			class="absolute inset-0 h-full w-full object-contain"
		/>
	</div>

	<!-- Slider Line -->
	<div class="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style="left: {sliderPosition}%">
		<!-- Slider Handle -->
		<div
			class="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg"
		>
			<svg class="h-5 w-5 text-stone-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			<svg
				class="-ml-3 h-5 w-5 text-stone-600"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
			</svg>
		</div>
	</div>

	<!-- Labels -->
	<div
		class="absolute top-4 left-4 rounded-full bg-stone-800/70 px-3 py-1.5 text-xs font-medium text-white"
	>
		Before
	</div>
	<div
		class="absolute top-4 right-4 rounded-full bg-stone-800/70 px-3 py-1.5 text-xs font-medium text-white"
	>
		After
	</div>
</div>

<script lang="ts">
	import PrivacyBadge from '$lib/components/PrivacyBadge.svelte';
	import ImageUploader from '$lib/components/ImageUploader.svelte';
	import EnhanceButton from '$lib/components/EnhanceButton.svelte';
	import ImageComparison from '$lib/components/ImageComparison.svelte';

	let selectedFile = $state<File | null>(null);
	let originalBase64 = $state<string>('');
	let originalPreviewUrl = $state<string>('');
	let enhancedBase64 = $state<string>('');
	let enhancedPreviewUrl = $state<string>('');
	let isProcessing = $state(false);
	let error = $state<string | null>(null);
	let uploaderRef = $state<ImageUploader | null>(null);

	let hasImage = $derived(!!originalBase64);
	let hasResult = $derived(!!enhancedBase64);

	function handleImageSelect(file: File, base64: string) {
		selectedFile = file;
		originalBase64 = base64;
		originalPreviewUrl = `data:${file.type};base64,${base64}`;
		enhancedBase64 = '';
		enhancedPreviewUrl = '';
		error = null;
	}

	async function handleEnhance() {
		if (!originalBase64 || !selectedFile) return;

		isProcessing = true;
		error = null;

		try {
			const response = await fetch('/api/enhance', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					imageBase64: originalBase64,
					mimeType: selectedFile.type
				})
			});

			const data = (await response.json()) as {
				success: boolean;
				imageBase64?: string;
				mimeType?: string;
				error?: string;
			};

			if (!data.success) {
				throw new Error(data.error || 'Enhancement failed');
			}

			enhancedBase64 = data.imageBase64 || '';
			enhancedPreviewUrl = `data:${data.mimeType};base64,${data.imageBase64}`;
		} catch (err) {
			if (err instanceof TypeError && err.message.includes('fetch')) {
				error = 'Network error. Please check your connection and try again.';
			} else {
				error = err instanceof Error ? err.message : 'Something went wrong';
			}
		} finally {
			isProcessing = false;
		}
	}

	function downloadEnhanced() {
		if (!enhancedPreviewUrl) return;
		const link = document.createElement('a');
		link.href = enhancedPreviewUrl;
		link.download = `halftwin-enhanced-${Date.now()}.png`;
		link.click();
	}

	function reset() {
		selectedFile = null;
		originalBase64 = '';
		originalPreviewUrl = '';
		enhancedBase64 = '';
		enhancedPreviewUrl = '';
		error = null;
		uploaderRef?.clearImage();
	}
</script>

<svelte:head>
	<title>HalfTwin – You, but on a really good day</title>
	<meta
		name="description"
		content="Subtle AI photo touch-ups for your selfies. Fix insecurities, keep authenticity. Still you, just enhanced."
	/>
	<meta
		name="keywords"
		content="photo enhancement, selfie editor, AI photo retouch, subtle photo edit, selfie touch up"
	/>
	<meta name="author" content="HalfTwin" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://halftwin.com" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://halftwin.com" />
	<meta property="og:title" content="HalfTwin – You, but on a really good day" />
	<meta
		property="og:description"
		content="Subtle AI photo touch-ups for your selfies. Fix insecurities, keep authenticity. Still you, just enhanced."
	/>
	<meta property="og:site_name" content="HalfTwin" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="HalfTwin – You, but on a really good day" />
	<meta
		name="twitter:description"
		content="Subtle AI photo touch-ups for your selfies. Fix insecurities, keep authenticity."
	/>

	<!-- Theme -->
	<meta name="theme-color" content="#2563eb" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="default" />

	<!-- Fonts -->
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12">
	<div class="mx-auto w-full max-w-2xl space-y-12">
		<!-- Header -->
		<header class="space-y-4 text-center">
			<div class="mb-4 inline-flex items-center gap-2">
				<div class="h-6 w-6 rounded-full bg-accent"></div>
				<span class="text-lg font-semibold tracking-tight">HalfTwin</span>
			</div>

			<h1 class="text-4xl font-bold tracking-tight text-balance text-text-primary sm:text-5xl">
				You, but on a <br class="hidden sm:block" /> really good day.
			</h1>
			<p class="mx-auto max-w-lg text-lg leading-relaxed text-balance text-text-secondary">
				About to send a selfie but worried they won't like what they see? We're your secret
				<span class="font-medium text-accent">'me but not me'</span> touch-up helper. Subtle fixes to
				your insecurities so you can hit send with confidence. It's still you, just enhanced.
			</p>
		</header>

		<!-- Main Interactions -->
		<div class="space-y-8">
			{#if hasResult}
				<!-- Result View -->
				<div class="fade-in space-y-6">
					<div class="overflow-hidden rounded-2xl border border-border bg-surface">
						<ImageComparison beforeSrc={originalPreviewUrl} afterSrc={enhancedPreviewUrl} />
					</div>

					<div class="flex items-center justify-center gap-4">
						<button class="btn-primary" onclick={downloadEnhanced}> Download Image </button>
						<button class="btn-secondary" onclick={reset}> Start Over </button>
					</div>
				</div>
			{:else}
				<!-- Upload View -->
				<div class="space-y-6">
					<ImageUploader
						bind:this={uploaderRef}
						onImageSelect={handleImageSelect}
						disabled={isProcessing}
					/>

					{#if error}
						<div
							class="rounded-lg bg-red-50 p-3 text-center text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
						>
							{error}
						</div>
					{/if}

					{#if hasImage}
						<div class="flex justify-center pt-2">
							<EnhanceButton onclick={handleEnhance} loading={isProcessing} disabled={!hasImage} />
						</div>
					{/if}
				</div>
			{/if}
		</div>

		<!-- Footer -->
		<footer class="space-y-4 pt-8 text-center">
			<PrivacyBadge variant="compact" />
			<nav class="flex items-center justify-center gap-4 text-sm text-text-secondary">
				<a href="/blog" class="transition-colors hover:text-accent">Blog</a>
				<span>•</span>
				<span>
					Made with ♥ by <a
						href="https://x.com/hamzadotsh"
						target="_blank"
						rel="noopener noreferrer"
						class="text-accent hover:underline">@hamzadotsh</a
					>
				</span>
			</nav>
		</footer>
	</div>
</main>

<style>
	.fade-in {
		animation: fadeIn 0.5s ease-out forwards;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>

<script lang="ts">
	import { formatDate } from '$lib/utils';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.meta.title} – HalfTwin Blog</title>
	<meta name="description" content={data.meta.description} />
	<meta name="keywords" content={data.meta.keywords?.join(', ') || ''} />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://halftwin.com/blog/{data.meta.slug}" />

	<!-- Open Graph -->
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
	<meta property="og:description" content={data.meta.description} />
	<meta property="og:url" content="https://halftwin.com/blog/{data.meta.slug}" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={data.meta.title} />
	<meta name="twitter:description" content={data.meta.description} />

	<!-- Article metadata -->
	<meta property="article:published_time" content={data.meta.date} />
</svelte:head>

<main class="blog-post">
	<div class="container">
		<a href="/blog" class="back-link">← Back to Blog</a>

		<article>
			<header class="post-header">
				<div class="post-meta">
					<time datetime={data.meta.date}>{formatDate(data.meta.date)}</time>
					<div class="categories">
						{#each data.meta.categories as category}
							<span class="category">{category}</span>
						{/each}
					</div>
				</div>
				<h1>{data.meta.title}</h1>
				<p class="description">{data.meta.description}</p>
			</header>

			<div class="prose">
				<data.content />
			</div>
		</article>

		<footer class="post-footer">
			<a href="/blog" class="back-link">← More articles</a>
			<a href="/" class="cta-link">Try HalfTwin →</a>
		</footer>
	</div>
</main>

<style>
	.blog-post {
		min-height: 100vh;
		padding: 2rem 1.5rem;
	}

	.container {
		max-width: 42rem;
		margin: 0 auto;
	}

	.back-link {
		display: inline-block;
		color: var(--text-secondary);
		text-decoration: none;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--accent);
	}

	article {
		margin-top: 2rem;
	}

	.post-header {
		margin-bottom: 2.5rem;
		padding-bottom: 2rem;
		border-bottom: 1px solid var(--border);
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.post-meta time {
		font-size: 0.875rem;
		color: var(--text-secondary);
	}

	.categories {
		display: flex;
		gap: 0.5rem;
	}

	.category {
		font-size: 0.75rem;
		padding: 0.25rem 0.625rem;
		background: var(--surface);
		color: var(--accent);
		border-radius: 9999px;
		text-transform: capitalize;
	}

	h1 {
		font-size: 2.25rem;
		font-weight: 700;
		color: var(--text-primary);
		line-height: 1.3;
		margin-bottom: 1rem;
	}

	.description {
		font-size: 1.125rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}

	/* Prose styles for rendered markdown */
	.prose {
		color: var(--text-primary);
		line-height: 1.75;
		font-size: 1.0625rem;
	}

	.prose :global(h2) {
		font-size: 1.5rem;
		font-weight: 600;
		margin-top: 2.5rem;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.prose :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-top: 2rem;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	.prose :global(p) {
		margin-bottom: 1.25rem;
	}

	.prose :global(ul),
	.prose :global(ol) {
		padding-left: 1.5rem;
		margin-bottom: 1.25rem;
	}

	.prose :global(li) {
		margin-bottom: 0.5rem;
	}

	.prose :global(a) {
		color: var(--accent);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	.prose :global(a:hover) {
		text-decoration: none;
	}

	.prose :global(strong) {
		font-weight: 600;
		color: var(--text-primary);
	}

	.prose :global(blockquote) {
		border-left: 3px solid var(--accent);
		padding-left: 1rem;
		margin: 1.5rem 0;
		font-style: italic;
		color: var(--text-secondary);
	}

	.prose :global(code) {
		background: var(--surface);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-size: 0.875em;
	}

	.prose :global(pre) {
		background: var(--surface);
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 1.5rem 0;
	}

	.prose :global(pre code) {
		background: none;
		padding: 0;
	}

	.prose :global(img) {
		max-width: 100%;
		height: auto;
		border-radius: 0.5rem;
		margin: 1.5rem 0;
	}

	.prose :global(hr) {
		border: none;
		border-top: 1px solid var(--border);
		margin: 2rem 0;
	}

	.post-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid var(--border);
	}

	.cta-link {
		color: var(--accent);
		text-decoration: none;
		font-weight: 500;
		transition: opacity 0.2s;
	}

	.cta-link:hover {
		opacity: 0.8;
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 1.75rem;
		}

		.prose {
			font-size: 1rem;
		}
	}
</style>

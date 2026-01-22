<script lang="ts">
	import { formatDate } from '$lib/utils';

	let { data } = $props();
</script>

<svelte:head>
	<title>Blog – HalfTwin | Dating & Selfie Tips</title>
	<meta
		name="description"
		content="Expert tips on online dating, selfie photography, and AI photo enhancement. Learn how to present your best self."
	/>
	<meta
		name="keywords"
		content="dating tips, selfie tips, online dating, photo enhancement, dating apps, selfie photography"
	/>
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="https://halftwin.com/blog" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://halftwin.com/blog" />
	<meta property="og:title" content="Blog – HalfTwin | Dating & Selfie Tips" />
	<meta
		property="og:description"
		content="Expert tips on online dating, selfie photography, and AI photo enhancement."
	/>
</svelte:head>

<main class="blog-page">
	<div class="container">
		<header class="blog-header">
			<a href="/" class="back-link">← Back to HalfTwin</a>
			<h1>Blog</h1>
			<p class="subtitle">Tips & guides for dating, selfies, and looking your best online</p>
		</header>

		<ul class="posts-list">
			{#each data.posts as post}
				<li class="post-card">
					<a href="/blog/{post.slug}" class="post-link">
						<div class="post-meta">
							<time datetime={post.date}>{formatDate(post.date)}</time>
							<div class="categories">
								{#each post.categories as category}
									<span class="category">{category}</span>
								{/each}
							</div>
						</div>
						<h2 class="post-title">{post.title}</h2>
						<p class="post-description">{post.description}</p>
					</a>
				</li>
			{/each}
		</ul>

		{#if data.posts.length === 0}
			<div class="empty-state">
				<p>No posts yet. Check back soon!</p>
			</div>
		{/if}
	</div>
</main>

<style>
	.blog-page {
		min-height: 100vh;
		padding: 2rem 1.5rem;
	}

	.container {
		max-width: 48rem;
		margin: 0 auto;
	}

	.blog-header {
		margin-bottom: 3rem;
	}

	.back-link {
		display: inline-block;
		color: var(--text-secondary);
		text-decoration: none;
		margin-bottom: 1.5rem;
		font-size: 0.875rem;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: var(--accent);
	}

	h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-secondary);
		font-size: 1.125rem;
	}

	.posts-list {
		list-style: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.post-card {
		border: 1px solid var(--border);
		border-radius: 1rem;
		overflow: hidden;
		transition:
			border-color 0.2s,
			box-shadow 0.2s;
	}

	.post-card:hover {
		border-color: var(--accent);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
	}

	.post-link {
		display: block;
		padding: 1.5rem;
		text-decoration: none;
		color: inherit;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.75rem;
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

	.post-title {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
		line-height: 1.4;
	}

	.post-description {
		color: var(--text-secondary);
		font-size: 0.9375rem;
		line-height: 1.6;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: var(--text-secondary);
	}

	@media (max-width: 640px) {
		h1 {
			font-size: 2rem;
		}

		.post-title {
			font-size: 1.125rem;
		}
	}
</style>

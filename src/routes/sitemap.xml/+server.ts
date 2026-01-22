import type { Post } from '$lib/types';

const site = 'https://halftwin.com';

async function getPosts(): Promise<Post[]> {
    const paths = import.meta.glob('/src/posts/*.md', { eager: true });
    const posts: Post[] = [];

    for (const path in paths) {
        const file = paths[path];
        const slug = path.split('/').at(-1)?.replace('.md', '');

        if (file && typeof file === 'object' && 'metadata' in file && slug) {
            const metadata = file.metadata as Omit<Post, 'slug'>;
            const post = { ...metadata, slug } satisfies Post;
            if (post.published) {
                posts.push(post);
            }
        }
    }

    return posts.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export async function GET() {
    const posts = await getPosts();

    const staticPages = [
        { url: '', priority: '1.0', changefreq: 'weekly' },
        { url: '/blog', priority: '0.9', changefreq: 'daily' }
    ];

    const blogPages = posts.map((post) => ({
        url: `/blog/${post.slug}`,
        lastmod: post.date,
        priority: '0.8',
        changefreq: 'monthly'
    }));

    const allPages = [...staticPages, ...blogPages];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages
            .map(
                (page) => `  <url>
    <loc>${site}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : ''}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
            )
            .join('\n')}
</urlset>`;

    return new Response(sitemap.trim(), {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'max-age=3600'
        }
    });
}

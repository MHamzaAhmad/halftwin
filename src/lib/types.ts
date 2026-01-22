export type Category = 'dating' | 'selfie' | 'ai' | 'tips' | 'apps';

export type Post = {
    title: string;
    slug: string;
    description: string;
    date: string;
    categories: Category[];
    published: boolean;
    keywords: string[];
};

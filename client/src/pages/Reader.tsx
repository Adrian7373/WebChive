import { useQuery } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import { Link, useParams } from "react-router-dom";

type Article = {
    id: number,
    title: string,
    byline: string | null,
    excerpt: string | null,
    content: string,
    readingTime: number | null,
    url: string,
    createdAt: string,
    tags: { id: number, name: string }[]
}

const fetchArticle = async (id: string): Promise<Article> => {
    const response = await fetch(`http://localhost:3000/api/v1/articles/${encodeURIComponent(id)}`);
    if (!response.ok) {
        throw new Error(response.status === 404 ? "Article not found" : "Failed to fetch article");
    }

    return response.json() as Promise<Article>;
}

export default function ReaderPage() {
    const { id } = useParams<{ id: string }>();
    const articleQuery = useQuery({
        queryKey: ["article", id],
        queryFn: () => fetchArticle(id as string),
        enabled: Boolean(id),
    });

    if (!id) {
        return <p className="text-red-700">An article ID is required.</p>;
    }

    if (articleQuery.isPending) {
        return <p>Loading article...</p>;
    }

    if (articleQuery.isError) {
        return (
            <div className="flex flex-col gap-4">
                <Link to="/" className="text-blue-700 hover:underline">← Back to dashboard</Link>
                <p className="text-red-700">{articleQuery.error.message}</p>
            </div>
        );
    }

    const article = articleQuery.data;

    return (
        <article className="mx-auto flex max-w-3xl flex-col gap-6">
            <Link to="/" className="text-blue-700 hover:underline">← Back to dashboard</Link>
            <header className="flex flex-col gap-3 border-b pb-6">
                <h1 className="text-4xl font-bold leading-tight">{article.title}</h1>
                {article.byline && <p className="text-gray-600">By {article.byline}</p>}
                <div className="flex flex-wrap gap-3 text-sm text-gray-500">
                    {article.readingTime && <span>{article.readingTime} min read</span>}
                    <time dateTime={article.createdAt}>
                        Saved {new Date(article.createdAt).toLocaleDateString()}
                    </time>
                </div>
                {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {article.tags.map((tag) => (
                            <span key={tag.id} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                                {tag.name}
                            </span>
                        ))}
                    </div>
                )}
            </header>
            {article.excerpt && <p className="text-lg italic text-gray-600">{article.excerpt}</p>}
            <div className="prose max-w-none leading-7">
                <ReactMarkdown>{article.content}</ReactMarkdown>
            </div>
            <a href={article.url} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                Read the original article
            </a>
        </article>
    )
}
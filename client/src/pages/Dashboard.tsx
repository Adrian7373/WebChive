import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";


type ArticlesResponse = {
    message: string,
    articles: Article[]
}

const fetchArticles = async (): Promise<Article[]> => {
    const response = await fetch("http://localhost:3000/api/v1/articles");
    if (!response.ok) throw new Error("Failed to fetch articles");

    const data: ArticlesResponse = await response.json();
    if (!Array.isArray(data.articles)) {
        throw new Error("Invalid articles response");
    }

    return data.articles;
}

type Article = {
    id: number,
    url: string,
    title: string,
    byline: string,
    excerpt: string,
    readingTime?: number,
    isArchived: boolean,
    createdAt: string,
    tags: Tag[]
}

type Tag = {
    id: number,
    name: string
}

export default function DashboardPage() {

    const queryClient = useQueryClient();

    const deleteArticle = async (id: string) => {
        const response = await fetch(`http://localhost:3000/api/v1/articles/${id}`, {
            method: "DELETE"
        })
        if (!response.ok) throw new Error("Failed to delete article");
        return response.json();
    }

    const { data, isPending, error } = useQuery({
        queryKey: ["articles"],
        queryFn: fetchArticles
    })

    const deleteMutation = useMutation({
        mutationFn: deleteArticle,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["articles"] });
        }
    })

    if (isPending) return (
        <>
            <div>Fetching articles...</div>
        </>
    )

    if (error) return (
        <>
            <div>An error has occured</div>
        </>
    )

    return (
        <div className="flex flex-col gap-4">
            <h1 className="font-bold text-4xl">Dashboard</h1>
            <div>
                <h2 className="text-xl">Articles</h2>
                <div className="flex flex-col gap-2">
                    {data.map((article) => (
                        <div key={article.id} className="border p-4">
                            <Link to={`/read/${article.id}`}>
                                <p>{article.title}</p>
                                <p>By {article.byline}</p>
                                <p>Time to read: {article.readingTime}</p>
                            </Link>
                            <button onClick={() => deleteMutation.mutate(String(article.id))} className="px-4 py-2">Delete</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
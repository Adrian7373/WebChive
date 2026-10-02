import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { prisma } from "../db.ts"

const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

export const saveArticle = async (req, res) => {
    try {
        const { url, tags } = req.body;

        const formattedTags = Array.isArray(tags)
            ? tags.map((tag) => String(tag).trim()).filter(Boolean)
            : typeof tags === "string"
                ? tags.split(",").map((tag) => tag.trim()).filter(Boolean)
                : [];

        if (!url) {
            return res.status(400).json({ error: "URL is required" });
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch URL: ${response.statusText}`);
        }
        const html = await response.text();

        const dom = new JSDOM(html, { url });

        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article) {
            return res.status(400).json({ error: "Could not extract article content from this page." });
        }

        const wordCount = article.textContent.split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / 238);

        const markdown = turndownService.turndown(article.content);

        const savedArticle = await prisma.article.create({
            data: {
                url,
                title: article.title,
                byline: article.byline,
                excerpt: article.excerpt,
                content: markdown,
                readingTime: readingTime,
                tags: {
                    connectOrCreate: formattedTags.map((name) => ({
                        where: { name },
                        create: { name },
                    })),
                },
            },
            include: {
                tags: true,
            },
        });

        res.status(201).json({
            message: "Article extracted successfully!",
            title: article.title
        });

    } catch (error) {
        console.error("Extraction error:", error);
        res.status(500).json({ error: "Internal server error during extraction." });
    }
};

export const getArticles = async (req, res) => {

    try {

        const articles = await prisma.article.findMany({
            omit: {
                content: true
            },
            orderBy: {
                createdAt: "desc"
            }, include: {
                tags: true
            }
        })
        res.status(200).json({ message: "Fetch successful", articles })
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch articles" })
    }


}

export const getArticleById = async (req, res) => {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Missing article ID" })

    try {
        const article = await prisma.article.findUnique({
            where: { id },
            include: {
                tags: true
            }
        })
        if (!article) return res.status(404).json({ error: "Article not found" })
        res.status(200).json(article)

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Server error" })
    }
}
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";


const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });

export const saveArticle = async (req, res) => {
    try {
        const { url, tags } = req.body;

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

        const markdown = turndownService.turndown(article.content);

        console.log("Extracted Title:", article.title);
        console.log("Markdown Snippet:", markdown.substring(0, 1000) + "...\n");

        res.status(201).json({
            message: "Article extracted successfully!",
            title: article.title
        });

    } catch (error) {
        console.error("Extraction error:", error);
        res.status(500).json({ error: "Internal server error during extraction." });
    }
};
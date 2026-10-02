import express from "express";
import { saveArticle } from "../controllers/articles.controller.js";

const router = express.Router();

router.post("/", saveArticle)
router.get("/", getArticles)
router.get("/:id", getArticleById)

export default router;
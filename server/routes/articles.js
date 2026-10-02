import express from "express";
import { saveArticle, getArticles, getArticleById, deleteArticle } from "../controllers/articles.controller.js";

const router = express.Router();

router.post("/", saveArticle)
router.get("/", getArticles)
router.get("/:id", getArticleById)
router.delete("/:id", deleteArticle)

export default router;
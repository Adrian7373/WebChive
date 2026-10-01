import express from "express";
import articleRouter from "./routes/articles.js"
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

//Routes
app.use("/api/v1/articles", articleRouter)

app.listen(3000, () => {
    console.log("Server running on port 3000.")
})
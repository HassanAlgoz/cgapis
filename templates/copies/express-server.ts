import bodyParser from "body-parser";
import chalk from "chalk";
import compression from "compression";
import express from "express";
import logger from "morgan";

// Routes
import APIRouter from "./api/routes";

// Server
const PORT = process.env.PORT || 3000;
const app = express();
app.listen(PORT, () => {
    console.log("%s Server running on http://localhost:%d in %s mode...", chalk.green("✓"), PORT, app.get("env"));
});

// middleware
app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Routes Registration
app.use("/", APIRouter);

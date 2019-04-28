const bodyParser = require("body-parser");
const chalk = require("chalk");
const compression = require("compression");
const express = require("express");
const logger = require("morgan");

// Routes
const APIRouter = require("./api/routes");

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

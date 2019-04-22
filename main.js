const fs = require("fs-extra");
const path = require("path");
const program = require("commander");

const ticker = require("./ticker");
const parser = require("./parser/parser");
const clientGenerator = require("./client-generator");
const serverGenerator = require("./server-generator");

// Configuration
const config = require("./config");

console.log("config", config);

fs.ensureDirSync(path.join(config.server_dir, "/api"));
fs.ensureDirSync(config.client_dir);

const spec = parser.parse(fs.readFileSync(config.api_spec_file));

async function main() {
    let t = ticker.tick("Generating client files...");
    await clientGenerator(spec).generateFiles({
        outputDir: config.client_dir,
    });
    t.tock();

    t = ticker.tick("Generating server files...");
    await serverGenerator(spec).generateFiles({
        outputDir: config.server_dir,
        apiPath:   config.api_relative_url,
    });

    fs.copyFileSync(
        path.join(__dirname, "templates", "copies", "express-server.js"),
        path.join(config.server_dir, "server.js")
    );
    t.tock();

    console.log("Done");
}
main();


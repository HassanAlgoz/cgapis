const fs = require("fs-extra");
const path = require("path");

const ticker = require("./ticker");
const config = require("./config");
const parser = require("./parser/parser");
const formatter = require("./formatter/formatter")();
const clientGenerator = require("./client-generator");
const serverGenerator = require("./server-generator");
const generateTypes = require("./types-generator/types-generator");


fs.ensureDirSync(path.join(config.server_dir, "/api"));
fs.ensureDirSync(config.client_dir);

const spec = parser.parse(fs.readFileSync(config.api_spec_file));

async function main() {
    await clientGenerator.generateFiles({
        spec:      spec,
        outputDir: config.client_dir,
    });

    await serverGenerator.generateFiles({
        spec:      spec,
        outputDir: config.server_dir,
        apiPath:   config.api_path,
    });

    fs.copyFileSync(
        path.join(__dirname, "templates", "copies", "express-server.ts"),
        path.join(config.server_dir, "server.ts")
    );

    console.log("Done");
}
main();


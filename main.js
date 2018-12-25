const fs = require("fs-extra");
const path = require("path");

const config = require("./config");
const clientGenerator = require("./client-generator");
const serverGenerator = require("./server-generator");
const parser = require("./parser");
const ticker = require("./ticker");

fs.ensureDirSync(path.join(config.server_dir, "/api"));

const spec = parser.parse(fs.readFileSync(config.api_spec_file));

const t1 = ticker.tick("Generating Client");
clientGenerator.generateFiles(spec, {
    outputDir:   config.client_dir,
    apiPath:     config.api_path,
});
t1.tock();

const t2 = ticker.tick("Generating Server");
serverGenerator.generateFiles(spec, {
    outputDir:   config.server_dir,
    apiPath:     config.api_path,
});
t2.tock();


const t3 = ticker.tick("copying express-server template");
fs.copyFileSync(
    path.join(__dirname, "templates", "express", "server.js"),
    path.join(config.server_dir, "server.js")
);
t3.tock();
console.log("Done");
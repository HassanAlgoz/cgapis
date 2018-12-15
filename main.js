const fs = require("fs-extra");
const path = require("path");
const djv = require("djv");

const config = require("./config");
const clientGenerator = require("./client-generator");
const serverGenerator = require("./server-generator");
const parser = require("./parser");

fs.ensureDirSync(path.join(config.server_dir, "/api"));
fs.ensureDirSync(path.join(config.client_dir, "/api"));

const def = parser.parse(fs.readFileSync(config.services_file));

console.log("Generating Client...");
clientGenerator.generateFiles(def, {
    outputDir:   config.client_dir,
    apiPath:     config.api_path,
});
console.log("Generating Server...");
serverGenerator.generateFiles(def, {
    outputDir:   config.server_dir,
    apiPath:     config.api_path,
});

console.log("Writing express server template");
fs.copyFileSync(
    path.join(__dirname, "templates", "express", "server.js"),
    path.join(config.server_dir, "server.js")
);

console.log("Done");
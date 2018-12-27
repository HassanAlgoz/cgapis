const fs = require("fs-extra");
const path = require("path");

const config = require("./config");
const clientGenerator = require("./client-generator");
const serverGenerator = require("./server-generator");
const parser = require("./parser/parser");
const ticker = require("./ticker");


fs.ensureDirSync(path.join(config.server_dir, "/api"));
fs.ensureDirSync(config.client_dir);

const spec = parser.parse(fs.readFileSync(config.api_spec_file));


clientGenerator.generateFiles(spec, {
    outputDir:   config.client_dir,
});


// serverGenerator.generateFiles(spec, {
//     outputDir:   config.server_dir,
//     apiPath:     config.api_path,
// });


fs.copyFileSync(
    path.join(__dirname, "templates", "copies", "express-server.js"),
    path.join(config.server_dir, "server.js")
);

console.log("Done");
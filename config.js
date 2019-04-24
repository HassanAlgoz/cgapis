const fs = require('fs');
const path = require("path");
const program = require("commander");

const config = {
    server_dir:       path.join(__dirname, "/output/server"),
    client_dir:       path.join(__dirname, "/output/client"),
    api_spec_file:    path.join(__dirname, "/input/api.json"),
    api_relative_url: "/api/v1",
    client_lang: "javascript",
    server_lang: "nodejs",
};

const packageJSON = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json')))

program
    .version(packageJSON.version)
    .description("Generates client-side & server-side code from a specification file")
    .option("-p, --spec <*.json>", "API specification file")
    .option("-a, --api-version <version>", "API Version")
    .option("-S, --server-dir <path>", "Directory for the generated server-side code")
    .option("-C, --client-dir <path>", "Directory for the generated client-side code")
    .option("-c, --client-lang <programming-language>", "javascript")
    .option("-s, --server-lang <programming-language>", "nodejs")
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp((str) => str);
    process.exit(1);
}

if (program["spec"]) config.api_spec_file = path.normalize(program["spec"]);
if (program["apiVersion"]) config.api_relative_url = "/api/" + program["apiVersion"];
if (program["serverDir"]) config.server_dir = path.normalize(program["serverDir"]);
if (program["clientDir"]) config.client_dir = path.normalize(program["clientDir"]);
if (program["clientLang"]) config.client_lang = path.normalize(program["clientLang"]);
if (program["serverLang"]) config.server_lang = path.normalize(program["serverLang"]);

module.exports = config;
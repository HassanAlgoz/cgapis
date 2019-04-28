import * as fs from 'fs';
import * as path from 'path';
import * as program from "commander";

const config = {
    server_dir:       path.join(process.cwd(), "/generated/server"),
    client_dir:       path.join(process.cwd(), "/generated/client"),
    api_spec_file:    path.join(process.cwd(), "api.json"),
    api_relative_url: "/api/v1",
    client_lang: "javascript",
    server_lang: "javascript",
};
export type Config = {
    server_dir: string;
    client_dir: string;
    api_spec_file: string;
    api_relative_url: string;
    client_lang:
        "js" | "javascript" |
        "ts" | "typescript"
    server_lang: 
        "js" | "javascript" |
        "ts" | "typescript" |
        "go" | "golang"     |
        "py" | "python"
};

program
    .version("0.0.7")
    .description("Generates client-side & server-side code from a specification file")
    .option("-p, --spec <*.json>", "API specification file")
    .option("-a, --api-version <version>", "API Version")
    .option("-S, --server-dir <path>", "Directory for the generated server-side code")
    .option("-C, --client-dir <path>", "Directory for the generated client-side code")
    .option("-c, --client-lang <programming-language>", "javascript")
    .option("-s, --server-lang <programming-language>", "javascript")
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

export default module.exports = config;
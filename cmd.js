const path = require("path");
const program = require("commander");
const config = require("./config");

program
    .version("0.0.10")
    .description("Generates client-side & server-side code from a specification file")
    .option("-p, --schemas-dir <*.json>", "Directory of API Schemas")
    .option("-P, --services-dir <*.json>", "Directory of API Service Definitions")
    .option("-a, --api-version <version>", "API Version")
    .option("-S, --server-dir <path>", "Directory for the generated server-side code")
    .option("-C, --client-dir <path>", "Directory for the generated client-side code")
    .option("-c, --client-lang <lang-framework>", "client language and framework")
    .option("-s, --server-lang <lang-framework>", "server language and framework");

const diff = require("./diff/diff");
program.command("diff <api1.json> <api2.json>")
    .action((f1, f2) => {
        diff(f1, f2);
    });

program.parse(process.argv);

// if (!process.argv.slice(2).length) {
//     program.outputHelp((str) => str)
//     process.exit(1)
// }

if (program["schemasDir"]) config.schemas_dir = path.normalize(program["schemasDir"]);
if (program["servicesDir"]) config.services_dir = path.normalize(program["servicesDir"]);
if (program["apiVersion"]) config.api_relative_url = "/api/" + program["apiVersion"];
if (program["serverDir"]) config.server_dir = path.normalize(program["serverDir"]);
if (program["clientDir"]) config.client_dir = path.normalize(program["clientDir"]);
if (program["clientLang"]) config.client_lang = path.normalize(program["clientLang"]);
if (program["serverLang"]) config.server_lang = path.normalize(program["serverLang"]);
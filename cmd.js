/**
 * cmd.js is the command-line interface that overwrites `config` from config.js with user's
 * supplied arguments
 */

const program = require("commander");

program
    .version("0.6.00")
    .description("Generates client-side SDKs and server-side APIs from specification files")
    .option("-p, --schemas-dir <path>", "Directory of API Schemas")
    .option("-P, --services-dir <path>", "Directory of API Services")
    .option("-e, --api-endpoint <relative_path>", "API endpoint")
    .option("-S, --server-dir <path>", "Directory for the generated server-side code")
    .option("-C, --client-dir <path>", "Directory for the generated client-side code")
    .option("-c, --client <language[-framework]>", "Client language [and framework]")
    .option("-s, --server <language[-framework]>", "Server language [and framework]");

program.parse(process.argv);
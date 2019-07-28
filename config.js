const path = require("path")
const program = require("commander")

const config = {
	server_dir:       path.join(process.cwd(), "/generated/server"),
	client_dir:       path.join(process.cwd(), "/generated/client"),
	api_spec_file:    path.join(process.cwd(), "api.json"),
	api_relative_url: "/api/v1",
	client_lang: "javascript-axios",
	server_lang: "javascript-express",
}

program
	.version("0.0.10")
	.description("Generates client-side & server-side code from a specification file")
	.option("-p, --spec <*.json>", "API specification file")
	.option("-a, --api-version <version>", "API Version")
	.option("-S, --server-dir <path>", "Directory for the generated server-side code")
	.option("-C, --client-dir <path>", "Directory for the generated client-side code")
	.option("-c, --client-lang <lang-framework>", "client language and framework")
	.option("-s, --server-lang <lang-framework>", "server language and framework")
	
const diff = require("./diff/diff")
program.command("diff <api1.json> <api2.json>")
	.action((f1, f2) => {
		diff(f1, f2)
	})

program.parse(process.argv)

if (!process.argv.slice(2).length) {
	program.outputHelp((str) => str)
	process.exit(1)
}

if (program["spec"]) config.api_spec_file = path.normalize(program["spec"])
if (program["apiVersion"]) config.api_relative_url = "/api/" + program["apiVersion"]
if (program["serverDir"]) config.server_dir = path.normalize(program["serverDir"])
if (program["clientDir"]) config.client_dir = path.normalize(program["clientDir"])
if (program["clientLang"]) config.client_lang = path.normalize(program["clientLang"])
if (program["serverLang"]) config.server_lang = path.normalize(program["serverLang"])

module.exports = config
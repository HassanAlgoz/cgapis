const path = require("path")
const fs = require("fs")

const formatter = require("../formatter/javascript")
const utils = require("./javascript-utils")

module.exports = {
	generate({spec, outputDir}) {
		const services = []
		for(const serviceName in spec.services) {
			const service = spec.services[serviceName]
			const methods = []
			for(const opName in service.ops) {
				const op = service.ops[opName]
				methods.push(generateRequestMethod(serviceName, opName, op.req, op.res))
			}
			services.push({
				serviceName: serviceName,
				methods:     methods,
			})
		}

		// Write api.js
		fs.writeFileSync(
			path.join(outputDir, "/api.js"),
			formatter.format(groupServiceOperations(services)),
			{encoding: "utf8"})


		function generateRequestMethod(serviceName, methodName, req, res) {
			const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search")
			return `
            async ${methodName}(${utils.initializedArgs("req", req)}) {
                try {
                    const response = await axios({
                        url: "/${serviceName}/${methodName}",
                        ${isGet
		? `method: "get", params: {${utils.CSP(req)}},`
		: `method: "post", data: {${utils.CSP(req)}},`}
                    });
                    const {${utils.CSP(res)}} = response.data
                    return [${utils.CSP(res)}];
                } catch (err) {
                    // Print a pretty error message
                    console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${utils.CSP(req)}})}) error:\`, err);
                }
            }`
		}
    
		function groupServiceOperations(services) {
			return `
            // AUTO GENERATED
            export default function (axios) {
                return {
                    ${services.map(s => `
                    ${s["serviceName"]}: {
                        ${s["methods"].join(",\n")}
                    }
                    `).join(",\n")}
                }
            }`
		}
	}
}
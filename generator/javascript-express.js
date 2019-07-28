const path = require("path")
const fs = require("fs")

const formatter = require("../formatter/javascript")
const utils = require("./javascript-utils")

module.exports = {
	generate({spec, outputDir, apiRelativeURL}) {
		const services = []
		for(const serviceName in spec.services) {
			const service = spec.services[serviceName]
			const methods = []
			const routes = []
			for(const opName in service.ops) {
				const op = service.ops[opName]
				routes.push(makeRoute(serviceName, opName, `${apiRelativeURL}/${serviceName}/${opName}`, op.req, op.res))
				methods.push(APIMethod(serviceName, opName, op.req, op.res))
			}
			services.push({
				serviceName: serviceName,
				methods:     methods,
				routes:      routes,
			})
		}

        
		fs.writeFileSync(
			path.join(outputDir, "/api/routes.js"),
			formatter.format(groupServiceRoutes(services)))

		services.forEach(service => {
			const serviceCode = formatter.format(`
                    ${service["methods"].join("\n\n")}
                `)
			fs.writeFileSync(
				path.join(outputDir, "/api", `/${service["serviceName"]}.js`),
				serviceCode)
		})

		fs.copyFileSync(
			path.join(__dirname, "../templates", "copies", "express-server.js"),
			path.join(outputDir, "server.js")
		)

		function makeRoute(serviceName, methodName, url, req, res) {
			const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search")
			return `
            const { ${methodName}, ${methodName}Middlewares } = require("./${serviceName}");
            router.${isGet? "get" : "post"}('${url}', ${methodName}Middlewares, async (req, res) => {
                const {${utils.CSP(req)}} = ${isGet? "req.query" : "req.body"};
                const jsonResponse = await ${methodName}({${utils.CSP(req)}});
                res.status(200).json(jsonResponse);
            });`
		}
    
		function APIMethod(serviceName, methodName, req, res) {
			return `
            module.exports.${methodName}Middlewares = [];
            module.exports.${methodName} = async function (${utils.initializedArgs("req", req)}) {
				// @Todo: Implement ${methodName}
				// Example: error return
				return [{ code: "UNIMPLEMENTED", errors: ['"${serviceName}.${methodName}" is not implemented'] }];
				// Example: ok return
				return [{ code: "OK" }, {${utils.CSP(res)}} ];
            }`
		}
    
		function groupServiceRoutes(services) {
			return `
            // AUTO GENERATED
            const router = require('express').Router();
            module.exports = router;\n\n
            ${services.map(service => `
                ${service["routes"].join("\n\n")}
            `).join("\n")}
        `
		}
	}
}
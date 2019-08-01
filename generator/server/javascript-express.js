/**
 * javascript-express.js is the implementation of a generator using javascript as a language and
 * express as the server-side framework
 */

const path = require("path");
const fs = require("fs");

const formatter = require("../../formatter/javascript");
const js = require("../javascript-utils");
const utils = require("../utils");

const spec = require("../../spec");
const config = require("../../config");

module.exports = {
    /**
     * generate takes no arguments and returns nothing
     */
    generate() {
        const services = [];
        for(const serviceName in spec.services) {
            const service = spec.services[serviceName][serviceName];
            const methods = [];
            const routes = [];
            for(const opName in service) {
                const op = service[opName];
                routes.push(makeRoute(serviceName, opName, `${config.api_relative_url}/${serviceName}/${opName}`, op.req, op.res));
                methods.push(APIMethod(serviceName, opName, op.req, op.res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
                routes:      routes,
            });
        }


        fs.writeFileSync(
            path.join(config.server_dir, "/api/routes.js"),
            formatter.format(groupServiceRoutes()));

        services.forEach(service => {
            const serviceCode = formatter.format(`
                    ${service["methods"].join("\n\n")}
                `);
            fs.writeFileSync(
                path.join(config.server_dir, "/api", `/${service["serviceName"]}.js`),
                serviceCode);
        });

        // fs.copyFileSync(
        //     path.join(__dirname, "../templates", "javascript-express", "server.js"),
        //     path.join(config.server_dir, "server.js")
        // );

        function makeRoute(serviceName, methodName, url, req, res) {
            return `
            const { ${methodName}, ${methodName}Middlewares } = require("./${serviceName}");
            router.${utils.isGet(methodName)? "get" : "post"}('${url}', ${methodName}Middlewares, async (req, res) => {
                const {${js.CSP(req)}} = ${utils.isGet(methodName)? "req.query" : "req.body"};
                const jsonResponse = await ${methodName}({${js.CSP(req)}});
                res.status(200).json(jsonResponse);
            });`;
        }

        function APIMethod(serviceName, methodName, req, res) {
            return `
            module.exports.${methodName}Middlewares = [];
            module.exports.${methodName} = async function (${js.initializedArgs("req", req, "=")}) {
				// @Todo: Implement ${methodName}
				return null;
            }`;
        }

        function groupServiceRoutes() {
            return `
            /**
             * \`routes.js\` calls your code.
             * Humans must not touch this file
             * AUTO GENERATED
             */

            const router = require('express').Router();
            module.exports = router;\n\n
            ${services.map(service => `
                ${service["routes"].join("\n\n")}
            `).join("\n")}
        `;
        }
    },
};
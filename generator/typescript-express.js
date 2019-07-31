const path = require("path");
const fs = require("fs");
const {compile} = require("json-schema-to-typescript");

const formatter = require("../formatter/javascript");
const js = require("./javascript-utils");
const utils = require("./utils");

const spec = require("../spec");
const config = require("../config");

module.exports = {
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
            path.join(config.server_dir, "/api/routes.ts"),
            formatter.format(groupServiceRoutes()));

        services.forEach(service => {
            const serviceCode = formatter.format(`
                    import { RequestHandler } from "express"
                    import * as ${config.types_prefix} from "./types"

                    ${service["methods"].join("\n\n")}
                `);
            fs.writeFileSync(
                path.join(config.server_dir, "/api", `/${service["serviceName"]}.ts`),
                serviceCode);
        });

        fs.copyFileSync(
            path.join(__dirname, "../templates", "javascript-express", "server.js"),
            path.join(config.server_dir, "server.js")
        );

        function makeRoute(serviceName, methodName, url, req, res) {
            return `
            import { ${methodName}, ${methodName}Middlewares } from "./${serviceName}";
            router.${utils.isGet(methodName)? "get" : "post"}('${url}', ${methodName}Middlewares, async (req: Request, res: Response) => {
                const {${js.CSP(req)}} = ${utils.isGet(methodName)? "req.query" : "req.body"};
                const jsonResponse = await ${methodName}(${js.CSP(req)});
                res.status(200).json(jsonResponse);
            });`;
        }

        function APIMethod(serviceName, methodName, req, res) {
            let numReturns = 0;
            if (res) {
                numReturns = Object.keys(res["properties"]["data"]["properties"]).length;
            }
            return `
            export const ${methodName}Middlewares: RequestHandler[] = [];
            export async function ${methodName}(${js.keyTypePairs("req", req)}) : Promise<[${js.CST("res", res)}]> {
				// @Todo: Implement ${methodName}
				return [
                    {
                        message: "Code for ${serviceName}.${methodName} is not implemented yet",
                        code: "UNIMPLEMENTED",
                    }
                    ${numReturns > 0 ? "," + Object.keys(res["properties"]["data"]["properties"]).map(k => "null").join(",") : ""}
                ]
            }`;
        }

        function groupServiceRoutes() {
            return `
            // AUTO GENERATED
            import { Router, Request, Response } from "express";
            const router = Router();
            export default router;\n\n

            ${services.map(service => `
                ${service["routes"].join("\n\n")}
            `).join("\n")}
        `;
        }
    },
};
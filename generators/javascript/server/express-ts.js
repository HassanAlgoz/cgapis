/**
 * typescript-express.js is the implementation of a generator using typescript as a language and
 * express as the server-side framework
 */

const path = require("path");
const fs = require("fs");

const tGen = require("../common/types-generator");
const formatter = require("../common/formatter");
const semantics = require("../../semantics");


module.exports = ({config, services, schemas}) => ({

    async generate() {
        config.typesPrefix = "Types";

        const js = require("../common/utils")({config});

        const result = [];
        for(const sName in services) {
            const service = services[sName];

            const methods = [];
            const routes = [];
            for(const opName in service["properties"]) {
                const op = service["properties"][opName]["properties"];
                routes.push(
                    makeRoute(sName, opName, `${config.spec.endpoint}/${sName}/${opName}`, op.req, op.res)
                );
                methods.push(
                    makeAPIMethod(sName, opName, op.req, op.res)
                );
            }

            result.push({
                name:    sName,
                methods: methods,
                routes:  routes,
            });
        }

        fs.mkdir(path.join(config.server.outputDir, "/api"), (err) => {
            if (err && err.code !== "EEXIST") return console.error(err);

            // Write /api/routes.ts
            fs.writeFile(path.join(config.server.outputDir, "/api/routes.ts"), formatter.format(groupServiceRoutes()), (err2) => {
                if (err2) return console.error(err2);
            });

            // Write api/{service}.ts files
            result.forEach(service => {
                const code = formatter.format(`
                        import { RequestHandler } from "express"
                        import * as ${config.typesPrefix} from "./types"
                        ${service["methods"].join("\n\n")}
                    `);
                fs.writeFile(path.join(config.server.outputDir, "/api", `/${service["name"]}.ts`), code, (err2) => {
                    if (err2) return console.error(err2);
                });
            });

            tGen({
                schemas:     schemas,
                schemasDir:  config.spec.schemasDir,
            }).generate().then(output => {
                fs.writeFile(path.join(config.server.outputDir, "/api", "/types.ts"), output, { encoding: "utf8" }, (err2) => {
                    if (err2) return console.error(err2);
                });
            }).catch(err2 => {
                if (err2) return console.error(err2);
            });
        });


        // fs.copyFileSync(
        //     path.join(__dirname, "../templates", "javascript-express", "server.js"),
        //     path.join(config.server.outputDir, "server.js")
        // );

        function makeRoute(serviceName, methodName, url, req, res) {
            return `
            import { ${methodName}, ${methodName}Middlewares } from "./${serviceName}";
            router.${semantics.isGet(methodName)? "get" : "post"}('${url}', ${methodName}Middlewares, async (req: Request, res: Response) => {
                const {${js.CSP(req)}} = ${semantics.isGet(methodName)? "req.query" : "req.body"};
                const jsonResponse = await ${methodName}(${js.CSP(req)});
                res.status(200).json(jsonResponse);
            });`;
        }

        function makeAPIMethod(serviceName, methodName, req, res) {
            console.log(serviceName, methodName);
            let numReturns = 0;
            if (res) {
                numReturns = Object.keys(res["properties"]["data"]["properties"]).length;
            }
            return `
            export const ${methodName}Middlewares: RequestHandler[] = [];
            export async function ${methodName}(${js.KTP("req", req)}) : Promise<[${js.CST("res", res)}]> {
                // @Todo: Implement ${methodName}
                return [
                    {
                        message: "Code for ${serviceName}.${methodName} is not implemented yet",
                        code: "NotImplemented",
                    }
                    ${numReturns > 0 ? "," + Object.keys(res["properties"]["data"]["properties"]).map(k => "null").join(",") : ""}
                ]
            }`;
        }

        function groupServiceRoutes() {
            return `
            /**
             * AUTO GENERATED, DO NOT EDIT
             * \`routes.ts\` calls your code.
             */
    
            import { Router, Request, Response } from "express";
            const router = Router();
            export default router;\n\n
    
            ${result.map(service => `
                ${service["routes"].join("\n\n")}
            `).join("\n")}
        `;
        }
    },
});


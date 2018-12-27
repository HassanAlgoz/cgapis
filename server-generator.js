const fs = require("fs");
const path = require("path");
const generateTypes = require("./types-generator/types-generator");
const formatter = require("./formatter/formatter")();

const typesPrefix = "Types";
const js = require("./templates/js")({typesPrefix});

module.exports = {

    async generateFiles({
        spec,
        outputDir,
        apiPath,
    }) {
        const services = [];
        for(const serviceName in spec.services) {
            const service = spec.services[serviceName];
            const methods = [];
            const routes = [];
            for(const opName in service.ops) {
                const op = service.ops[opName];
                routes.push(makeRoute(serviceName, opName, `${apiPath}/${serviceName}/${opName}`, op.req, op.res));
                methods.push(APIMethod(serviceName, opName, op.req, op.res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
                routes:      routes,
            });
        }

        let tsCode = await generateTypes(spec.refs);
        tsCode = formatter.format(`
            // AUTO GENERATED
        `) + "\n" + tsCode;
        fs.writeFileSync(path.join(outputDir, "/api-types.ts"), tsCode);

        const routesCode = `
            // AUTO GENERATED
            import { Router } from "express";
            const router = Router();
            export default router;\n\n
            ${services.map(service => `
                ${service.routes.join("\n\n")}
            `).join("\n")}
        `;
        fs.writeFileSync(path.join(outputDir, "/api/routes.ts"), formatter.format(routesCode));

        services.forEach(service => {
            const serviceCode = formatter.format(`
                import * as ${typesPrefix} from "./api-types"
                ${service.methods.join("\n\n")}
            `);
            fs.writeFileSync(path.join(outputDir, "/api", `/${service.serviceName}.ts`), serviceCode);
        });
    },
};

function APIMethod (serviceName, methodName, req, res) {
    return `
    export const ${methodName}Middlewares = [];
    export async function ${methodName}({${js.CSP(req)}}:{${js.keyTypePairs("req", req)}}) : Promise<[${js.CST("res", res)}]> {
        // @Todo: Implement ${methodName}
        return [
            {
                code: "UNIMPLEMENTED",
                errors: ['"${serviceName}.${methodName}" is not implemented'],
            },
            null
        ];
    }`;
}

function makeRoute(serviceName, methodName, url, req, res) {
    const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
    return `
    import { ${methodName}, ${methodName}Middlewares } from "./${serviceName}";
    router.${isGet? "get" : "post"}('${url}', ${methodName}Middlewares, async (req, res) => {
        const {${js.CSP(req)}} = ${isGet? "req.query" : "req.body"};
        const jsonResponse = await ${methodName}({${js.CSP(req)}});
        res.status(200).json(jsonResponse);
    });`;
}
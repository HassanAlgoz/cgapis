const fs = require("fs");
const path = require("path");
const generateTypes = require("./types-generator/types-generator");
const formatter = require("./formatter/formatter")();

const js = require("./templates/js")();

module.exports = function(spec) {

    return {
        async generateFiles({
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

            // let tsCode = await generateTypes(spec.refs);
            // tsCode = formatter.format(`
            //     // AUTO GENERATED
            // `) + "\n" + tsCode;
            // fs.writeFileSync(path.join(outputDir, "/api/api-types.ts"), tsCode);

            const routesCode = `
                // AUTO GENERATED
                const router = require('express').Router();
                module.exports = router;\n\n
                ${services.map(service => `
                    ${service.routes.join("\n\n")}
                `).join("\n")}
            `;
            fs.writeFileSync(path.join(outputDir, "/api/routes.js"), formatter.format(routesCode));

            services.forEach(service => {
                const serviceCode = formatter.format(`
                    ${service.methods.join("\n\n")}
                `);
                fs.writeFileSync(path.join(outputDir, "/api", `/${service.serviceName}.js`), serviceCode);
            });
        },
    };

    function APIMethod (serviceName, methodName, req, res) {
        return `
        module.exports.${methodName}Middlewares = [];
        module.exports.${methodName} = async function (${js.initObjectValues("req", req, spec.refs)}) {
            // @Todo: Implement ${methodName}
            return [
                {
                    code: "UNIMPLEMENTED",
                    errors: ['"${serviceName}.${methodName}" is not implemented'],
                },
                ${js.initObjectValues("res", res, spec.refs)}
            ];
        }`;
    }

    function makeRoute(serviceName, methodName, url, req, res) {
        const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
        return `
        const { ${methodName}, ${methodName}Middlewares } = require("./${serviceName}");
        router.${isGet? "get" : "post"}('${url}', ${methodName}Middlewares, async (req, res) => {
            const {${js.CSP(req)}} = ${isGet? "req.query" : "req.body"};
            const jsonResponse = await ${methodName}({${js.CSP(req)}});
            res.status(200).json(jsonResponse);
        });`;
    }

};


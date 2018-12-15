const t = require("./templates.js");
const formatter = require("./formatter")();
const fs = require("fs");
const path = require("path");

module.exports = {

    generateFiles(def, {
        outputDir,
        apiPath,
    }) {
        const services = [];
        for(const serviceName in def.services) {
            const service = def.services[serviceName];
            const methods = [];
            const routes = [];
            for(const opName in service.ops) {
                const op = service.ops[opName];
                const req = t.initializeObj(op.req, def.types);
                const res = {
                    ok:   t.initializeObj(op.res.ok, def.types),
                    fail: t.initializeObj(op.res.fail, def.types),
                };
                // Methods starting with "get" are sent as HTTP GET requests with the parameters in the querystring of the URL.
                // Other methods are sent as HTTP POST requests with the parameters in the body.
                if (opName.startsWith("get")) {
                    routes.push(httpGet(serviceName, opName, `${apiPath}/${serviceName}/${opName}`, req, res));
                } else {
                    routes.push(httpPost(serviceName, opName, `${apiPath}/${serviceName}/${opName}`, req, res));
                }
                methods.push(APIMethod(serviceName, opName, req, res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
                routes:      routes,
            });
        }

        const routesCode = `
            // Auto-generated routes
            // DO NOT MODIFY THIS FILE
            const router = require("express").Router();
            module.exports = router;\n\n
            ${services.map(service => `
                ${service.routes.join("\n\n")}
            `).join("\n")}
        `;
        fs.writeFileSync(path.join(outputDir, "/api/routes.js"), formatter.format(routesCode));

        services.forEach(service => {
            const serviceCode = formatter.format(`
                // Auto-generated service "${service.serviceName}.js"
                module.exports = {
                    ${service.methods.join(",\n\n")}
                };
            `)
                .replace(/\/\/#{/g, "/*")
                .replace(/\/\/#}/g, "*/");
            // fs.writeFileSync(path.join(outputDir, "/api", `/${service.serviceName}.js`), formatter.format(serviceCode));
            fs.writeFileSync(path.join(outputDir, "/api", `/${service.serviceName}.js`), serviceCode);
        });
    },
};

function APIMethod (serviceName, methodName, req, res) {
    return `
    async ${methodName}(${t.defaultParameters(req)}) {
        throw '"${serviceName}.${methodName}" is not implemented';
        //#{ @TODO: Success
        return (${t.defaultReturn(res.ok)});
        //#}

        //#{ @TODO: Fail
        return (${t.defaultReturn(res.fail)});
        //#}
    }`;
}

function httpGet(serviceName, methodName, url, req, res) {
    return `
    const { ${methodName} } = require('./${serviceName}');
    router.get('${url}', async (req, res, next) => {
        const ${t.destructuring(req)} = req.query;
        const jsonResponse = await ${methodName}(${t.destructuring(req)});
        res.status(200).json(jsonResponse);
    });`;
}

function httpPost(serviceName, methodName, url, req, res) {
    return `
    const { ${methodName} } = require('./${serviceName}');
    router.post('${url}', async (req, res, next) => {
        const ${t.destructuring(req)} = req.body;
        const jsonResponse = await ${methodName}(${t.destructuring(req)});
        res.status(200).json(jsonResponse);
    });`;
}
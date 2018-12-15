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
            for(const opName in service.ops) {
                const op = service.ops[opName];
                const req = t.initializeObj(op.req, def.types);
                const res = {
                    ok:   t.initializeObj(op.res.ok, def.types),
                    fail: t.initializeObj(op.res.fail, def.types),
                };
                // Generate the Fetch Method
                // Methods starting with "get" are sent as HTTP GET requests with the parameters in the querystring of the URL.
                // Other methods are sent as HTTP POST requests with the parameters in the body.
                if (opName.startsWith("get")) {
                    methods.push(fetchGet(serviceName, opName, `${apiPath}/${serviceName}/${opName}`, req, res));
                } else {
                    methods.push(fetchPost(serviceName, opName, `${apiPath}/${serviceName}/${opName}`, req, res));
                }
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
            });
        }

        const code = `
            // Auto-generated: PLEASE DO NOT CHANGE FILE
            function getJSONAsURLEncoded(json) {
                const params = new URLSearchParams()
                for (const [key, value] of Object.entries(json)) {
                    params.append(key, value);
                }
                return "?" + params.toString();
            }
            ${services.map(service => `
                // Auto-generated service "${service.serviceName}"
                export const ${service.serviceName} = {
                    ${service.methods.join(",\n")}
                };
            `).join("\n")}
        `;
        fs.writeFileSync(path.join(outputDir, "/api.js"), formatter.format(code));
    },
};

function fetchGet (serviceName, methodName, url, req, res) {
    return `
    ${methodName}(${t.objDefaultParameters(req)}) {
        return fetch("${url}" + getJSONAsURLEncoded(_obj), {
            method: "GET",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.error("${serviceName}Service.${methodName} error:", response.statusText());
            }
        })
        .then(json => {
            const ${t.destructuring(res.ok)} = json;
            return (${t.destructuring(res.ok)});
        })
        .catch(err => {
            console.error("${serviceName}Service.${methodName} error:", err);
        });
    }`;
}

function fetchPost(serviceName, methodName, url, req, res) {
    return `
    ${methodName}(${t.defaultParameters(req)}) {
        return fetch("${url}", {
            method: "POST",
            body: JSON.stringify(${t.destructuring(req)}),
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                console.error("${serviceName}Service.${methodName} error:", response.statusText());
            }
        })
        .then(json => {
            const ${t.destructuring(res.ok)} = json;
            return (${t.destructuring(res.ok)});
        })
        .catch(err => {
            console.error("${serviceName}Service.${methodName} error:", err);
        });
    }`;
}
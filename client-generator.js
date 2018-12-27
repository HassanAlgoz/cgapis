const generateTypes = require("./types-generator/types-generator");
const formatter = require("./formatter/formatter")();
const fs = require("fs");
const path = require("path");

const typesPrefix = "Types";
const js = require("./templates/js")({typesPrefix});

module.exports = {

    async generateFiles(spec, {outputDir}) {
        const services = [];
        for(const serviceName in spec.services) {
            const service = spec.services[serviceName];
            const methods = [];
            for(const opName in service.ops) {
                const op = service.ops[opName];
                // Generate the Fetch Method
                // Methods starting with "get" are sent as HTTP GET requests with the parameters in the querystring of the URL.
                // Other methods are sent as HTTP POST requests with the parameters in the body.
                methods.push(generateRequestMethod(serviceName, opName, op.req, op.res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
            });
        }

        const tsCode = await generateTypes(spec.refs);
        fs.writeFileSync(path.join(outputDir, "/api-types.ts"), tsCode);

        const code = `
            // Auto-generated: PLEASE DO NOT CHANGE FILE
            import * as ${typesPrefix} from "./api-types"

            export default function ({axios}) {
                return {
                    ${services.map(service => `
                    // Auto-generated service "${service.serviceName}"
                    ${service.serviceName}: {
                        ${service.methods.join(",\n")}
                    }
                    `).join(",\n")}
                }
            }
        `;
        fs.writeFileSync(path.join(outputDir, "/api.ts"), formatter.format(code));
    },
};

function generateRequestMethod (serviceName, methodName, req, res) {
    const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
    return `
    async ${methodName}(${js.keyTypePairs("req", req)}) : Promise<[${js.CST("res", res)}]> {
        try {
            const response = await axios({
                url: "/${serviceName}/${methodName}",
                ${isGet
        ? `method: "get", params: {${js.CSP(req)}},`
        : `method: "post", data: {${js.CSP(req)}},`
}
            });
            const res = response.data as {
                ${js.keyTypePairs("res", res)}
            };
            return [res.status, res.users];
        } catch (err) {
            // Print a pretty error message
            console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${js.CSP(req)}})}) error:\`, err);
        }
    }`;
}
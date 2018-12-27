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
    }) {
        const services = [];
        for(const serviceName in spec.services) {
            const service = spec.services[serviceName];
            const methods = [];
            for(const opName in service.ops) {
                const op = service.ops[opName];
                methods.push(generateRequestMethod(serviceName, opName, op.req, op.res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
            });
        }

        let tsCode = await generateTypes(spec.refs);
        tsCode = formatter.format(`
            // AUTO GENERATED
        `) + "\n" + tsCode;
        fs.writeFileSync(path.join(outputDir, "/api-types.ts"), tsCode);

        const code = `
            // AUTO GENERATED
            import { AxiosInstance } from 'axios';
            import * as ${typesPrefix} from "./api-types"
            
            export default function (axios: AxiosInstance) {
                return {
                    ${services.map(service => `
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
    async ${methodName}({${js.CSP(req)}}:{${js.keyTypePairs("req", req)}}) : Promise<[${js.CST("res", res)}]> {
        try {
            const response = await axios({
                url: "/${serviceName}/${methodName}",
                ${isGet
        ? `method: "get", params: {${js.CSP(req)}},`
        : `method: "post", data: {${js.CSP(req)}},`
}
            });
            const {${js.CSP(res)}} = response.data
            return [${js.CSP(res)}];
        } catch (err) {
            // Print a pretty error message
            console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${js.CSP(req)}})}) error:\`, err);
        }
    }`;
}
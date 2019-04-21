const fs = require("fs");
const path = require("path");
const formatter = require("./formatter/formatter")();

const js = require("./templates/js")();

module.exports = function(spec) {
    return {

        async generateFiles({
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


            const code = `
                // AUTO GENERATED
                /**
                 * @param axios : AxiosInstance
                */
                export default function (axios) {
                    return {
                        ${services.map(service => `
                        ${service.serviceName}: {
                            ${service.methods.join(",\n")}
                        }
                        `).join(",\n")}
                    }
                }
            `;
            fs.writeFileSync(path.join(outputDir, "/api.js"), formatter.format(code));
        },
    };

    function generateRequestMethod (serviceName, methodName, req, res) {
        const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
        return `
        async ${methodName}(${js.initObjectValues("req", req, spec.refs)}) {
            try {
                const response = await axios({
                    url: "/${serviceName}/${methodName}",
                    ${isGet
        ? `method: "get", params: {${js.CSP(req)}},`
        : `method: "post", data: {${js.CSP(req)}},`}
                });
                const {${js.CSP(res)}} = response.data
                return [${js.CSP(res)}];
            } catch (err) {
                // Print a pretty error message
                console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${js.CSP(req)}})}) error:\`, err);
            }
        }`;
    }

};

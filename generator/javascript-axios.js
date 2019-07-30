const path = require("path");
const fs = require("fs");

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
            // console.log("service", service);
            const methods = [];
            for(const opName in service) {
                const op = service[opName];
                methods.push(generateRequestMethod(serviceName, opName, op.req, op.res));
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
            });
        }

        // Write api.js
        fs.writeFileSync(
            path.join(config.client_dir, "/api.js"),
            formatter.format(groupServiceOperations()),
            {encoding: "utf8"});


        function generateRequestMethod(serviceName, methodName, req, res) {
            return `
            async ${methodName}(${js.initializedArgs("req", req, "=")}) {
                try {
                    const response = await axios({
                        url: "/${serviceName}/${methodName}",
                        ${utils.isGet(methodName)
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

        function groupServiceOperations() {
            return `
            // AUTO GENERATED
            export default function (axios) {
                return {
                    ${services.map(s => `
                    ${s["serviceName"]}: {
                        ${s["methods"].join(",\n")}
                    }
                    `).join(",\n")}
                }
            }`;
        }
    },
};
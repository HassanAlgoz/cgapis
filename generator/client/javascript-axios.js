/**
 * javascript-axios.js is the implementation of a generator using javascript as a language and
 * axios as the client-side fetching API
 */

const path = require("path");
const fs = require("fs");

const formatter = require("../../formatter/javascript");
const js = require("../javascript-utils");
const utils = require("../utils");

const spec = require("../../spec");
const config = require("../../config");

module.exports = {
    /**
     * generate takes no arguments and returns nothing
     */
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
            async ${methodName}(req=${js.initializedArgs("req", req, ":")}) {
                const {${js.CSP(req)}} = req;
                // Validate request against its schema
                const errors = validateRequest(req);
                if (errors) return console.error(errors);

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
            import Ajv from 'ajv';
            
            const ajv = new Ajv({
                allErrors: true, // check all rules collecting all errors.
                schemas:   [${JSON.stringify(Object.values(spec.schemas))}],
            });

            function validateRequest(schema, data) {
                const validate = ajv.compile(schema)
                if (!validate(data)) {
                    const errors = [];
                    for(const err of validate.errors) {
                        const dataPath = err.dataPath.substring(1);
                        if (err.keyword === "enum") {
                            const enumValues = err.params.allowedValues.map(v => \`"\${v}"\`).join(", ");
                            errors.push(dataPath + " " + err.message + ": " + enumValues);
                            continue;
                        }
                        errors.push(dataPath + " " + err.message);
                    }
                    return errors;
                }
                return null;
            }

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
/**
 * typescript-axios.js is the implementation of a generator using typescript as a language and
 * axios as the client-side fetching API
 */
const path = require("path");
const fs = require("fs");

const typesGenerator = require("../../types-generator/typescript");
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

        // Write api.ts
        fs.writeFile(path.join(config.client_dir, "/api.ts"), formatter.format(groupServiceOperations()), (err) => {
            if (err) return console.error(err);
        });

        // Write types.ts
        typesGenerator()
            .then(types => {
                fs.writeFile(path.join(config.client_dir, "types.ts"), types, { encoding: "utf8" }, (err) => {
                    if (err) return console.error(err);
                });
            })
            .catch(err => {
                if (err) return console.error(err);
            });


        function generateRequestMethod(serviceName, methodName, req, res) {
            let numReturns = 0;
            if (res) {
                numReturns = Object.keys(res["properties"]["data"]["properties"]).length;
            }
            return `
            async ${methodName}(${js.keyTypePairs("req", req)}) : Promise<[${js.CST("res", res)}]> {
                // Validate request against its schema
                if (validateBeforeRequest) {
                    const errors = validateRequest(${JSON.stringify(req)}, {${js.CSP(req)}});
                    if (errors) {
                        return [
                            {
                                code: "INVALID_PARAMETERS",
                                message: "Check the documentation for the schema of the parameters",
                                parameters: errors,
                            }
                            ${numReturns > 0 ? "," + Object.keys(res["properties"]["data"]["properties"]).map(k => "null").join(",") : ""}
                        ]
                    };
                }

                try {
                    const response = await axios({
                        url: "/${serviceName}/${methodName}",
                        ${utils.isGet(methodName)
        ? `method: "get", params: {${js.CSP(req)}},`
        : `method: "post", data: {${js.CSP(req)}},`}
                    });
                    return response.data;
                } catch (err) {
                    return [
                        {
                            code: "UNKNOWN",
                            message: "(" + err.response.status + ") " + err.message,
                        }
                        ${numReturns > 0 ? "," + Object.keys(res["properties"]["data"]["properties"]).map(k => "null").join(",") : ""}
                    ]
                }
            }`;
        }

        function groupServiceOperations() {
            return `
            // AUTO GENERATED
            import { AxiosInstance } from 'axios';
            import * as ${config.types_prefix} from "./types"

            import Ajv from 'ajv';
            
            const ajv = new Ajv({
                allErrors: true, // check all rules collecting all errors.
                schemas:   [${JSON.stringify(Object.values(spec.schemas))}],
            });

            function validateRequest(schema, data) {
                const validate = ajv.compile(schema);
                if (!validate(data)) {
                    const errMap = {};
                    // console.log(validate.errors);
                    for(const err of validate.errors) {
                        const dataPath = err.dataPath.substring(1);
                        if (err.keyword === "enum") {
                            const enumValues = err.params["allowedValues"].map(v => \`"\${v}"\`).join(", ");
                            errMap[dataPath] = err.message + ": " + enumValues;
                            continue;
                        }
                        errMap[dataPath] = err.message;
                    }
                    return errMap;
                }
                return null;
            }

            export default function (axios: AxiosInstance, validateBeforeRequest: boolean = true) {
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
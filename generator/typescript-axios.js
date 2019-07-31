const path = require("path");
const fs = require("fs");
const {compile} = require("json-schema-to-typescript");

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
            path.join(config.client_dir, "/api.ts"),
            formatter.format(groupServiceOperations()),
            {encoding: "utf8"});


        function generateRequestMethod(serviceName, methodName, req, res) {
            let numReturns = 0;
            if (res) {
                numReturns = Object.keys(res["properties"]["data"]["properties"]).length;
            }
            return `
            async ${methodName}({${js.CSP(req)}}:${js.keyTypePairs("req", req)}) : Promise<[${js.CST("res", res)}]> {
                // Validate request against its schema
                if (validateBeforeRequest) {
                    const errors = validateRequest(${JSON.stringify(req)}, {${js.CSP(req)}});
                    if (errors) {
                        return [
                            {
                                message: "Check the documentation for the schema of the parameters",
                                code: "INVALID_PARAMETERS",
                                errors: errors,
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
                    // Print a pretty error message
                    console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${js.CSP(req)}})}) error:\`, err);
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
                    return validate.errors;
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
/**
 * The implementation of a generator using typescript as a language and
 * axios as the client-side fetching API
 */
const path = require("path");
const fs = require("fs");

const tGen = require("../common/types-generator");
const formatter = require("../common/formatter");
const semantics = require("../../semantics");

module.exports = ({config, services, schemas}) => ({

    async generate() {
        config.typesPrefix = "Types";

        const js = require("../common/utils")({config});

        const result = [];
        for(const sName in services) {
            const service = services[sName];
            const methods = [];
            for(const opName in service["properties"]) {
                const op = service["properties"][opName]["properties"];
                methods.push(generateRequestMethod(sName, opName, op.req, op.res));
            }
            result.push({
                serviceName: sName,
                methods:     methods,
            });
        }

        // Write sdk.ts
        const sdkOutput = formatter.format(groupServiceOperations());
        fs.writeFile(path.join(config.client.outputDir, "/sdk.ts"), sdkOutput, (err) => {
            if (err) return console.error(err);
        });

        // Write types.ts
        tGen({
            schemas:     schemas,
            schemasDir:  config.spec.schemasDir,
        }).generate().then(typesOutput => {
            fs.writeFile(path.join(config.client.outputDir, "/types.ts"), typesOutput, { encoding: "utf8" }, (err2) => {
                if (err2) return console.error(err2);
            });
        }).catch(err2 => {
            if (err2) return console.error(err2);
        });


        function generateRequestMethod(serviceName, methodName, req, res) {
            let numReturns = 0;
            if (res) {
                numReturns = Object.keys(res["properties"]["data"]["properties"]).length;
            }
            return `
        async ${methodName}(${js.KTP("req", req)}) : Promise<[${js.CST("res", res)}]> {
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
                    ${semantics.isGet(methodName)
        ? `method: "get", params: {${js.CSP(req)}},`
        : `method: "post", data: {${js.CSP(req)}},`}
                });
                return response.data;
            } catch (err) {
                return [
                    {
                        code: "Unknown",
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
        import * as ${config.typesPrefix} from "./types"

        import Ajv from 'ajv';
        
        const ajv = new Ajv({
            allErrors: true, // check all rules collecting all errors.
            schemas:   ${JSON.stringify(Object.values(schemas))},
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
                ${result.map(s => `
                ${s["serviceName"]}: {
                    ${s["methods"].join(",\n")}
                }
                `).join(",\n")}
            }
        }`;
        }
    },
});
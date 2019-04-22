module.exports = function({config, spec}) {

    return {
        client: {
            generateRequestMethod(serviceName, methodName, req, res) {
                const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
                return `
                async ${methodName}(${initializedArgs("req", req)}) {
                    try {
                        const response = await axios({
                            url: "/${serviceName}/${methodName}",
                            ${isGet
                ? `method: "get", params: {${CSP(req)}},`
                : `method: "post", data: {${CSP(req)}},`}
                        });
                        const {${CSP(res)}} = response.data
                        return [${CSP(res)}];
                    } catch (err) {
                        // Print a pretty error message
                        console.error(\`${serviceName}Service.${methodName}(\${JSON.stringify({${CSP(req)}})}) error:\`, err);
                    }
                }`;
            },
    
            groupServiceOperations(services=[]) {
                return `
                // AUTO GENERATED
                export default function (axios) {
                    return {
                        ${services.map(s => `
                        ${s.serviceName}: {
                            ${s.methods.join(",\n")}
                        }
                        `).join(",\n")}
                    }
                }`
            },
        },

        server: {
            makeRoute(serviceName, methodName, url, req, res) {
                const isGet = methodName.startsWith("get") || methodName.startsWith("find") || methodName.startsWith("list") || methodName.startsWith("fetch") || methodName.startsWith("search");
                return `
                const { ${methodName}, ${methodName}Middlewares } = require("./${serviceName}");
                router.${isGet? "get" : "post"}('${url}', ${methodName}Middlewares, async (req, res) => {
                    const {${CSP(req)}} = ${isGet? "req.query" : "req.body"};
                    const jsonResponse = await ${methodName}({${CSP(req)}});
                    res.status(200).json(jsonResponse);
                });`;
            },
    
            APIMethod (serviceName, methodName, req, res) {
                return `
                module.exports.${methodName}Middlewares = [];
                module.exports.${methodName} = async function (${initializedArgs("req", req)}) {
                    // @Todo: Implement ${methodName}
                    return [
                        {
                            code: "UNIMPLEMENTED",
                            errors: ['"${serviceName}.${methodName}" is not implemented'],
                        },
                        ${initializedArgs("res", res)}
                    ];
                }`;
            },

            groupServiceRoutes(services=[]) {
                return `
                // AUTO GENERATED
                const router = require('express').Router();
                module.exports = router;\n\n
                ${services.map(service => `
                    ${service.routes.join("\n\n")}
                `).join("\n")}
            `
            }
        }
    };

    function initializedArgs(key, obj) {
        if (obj.hasOwnProperty('properties')) {
            return `{${Object.keys(obj['properties']).map(k => initializedArgs(k, obj['properties'][k])).join(',')}}`
        }
        let val = null;
        if (obj["default"]) {
            // Check type of default with 'type'
            if (obj.hasOwnProperty("type") && typeof obj.default !== obj.type) {
                console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
            }
            val = `${obj.default}`;
        } else {
            switch(obj["type"]) {
                // Primitive Types
                case "string":  val = "\"\"";   break;
                case "number":
                case "integer": val = "0";      break;
                case "boolean": val = "false";  break;
                case "array":   val = "[]";     break;
                case "object":  val = "{}";     break;
            }
        }
        return `${key}=${val}`;
    }

    /** Comma Separated Properties */
    function CSP(obj) {
        return `${Object.keys(obj.properties).join(", ")}`;
    }
}
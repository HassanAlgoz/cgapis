module.exports = function({config, spec}) {

    return {
        generateClientRequestMethod(serviceName, methodName, req, res) {
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
        }
    };
    
    // function methodSignature({name="", args=[], argsTypes=[], returnsTypes=[]}) {
    //     if (name === "" || !args || args.length === 0) {
    //         throw new Error(`Invalid method signature with name=${name} and args=${args}`);
    //     }
    //     return `async ${methodName}(${initObjectValues("req", req, spec.refs)}) {

    //     }`
    // }

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
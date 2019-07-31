const spec = require("../spec");
const config = require("../config");

module.exports = {

    /** destructured object argument with initial values set with an assignment operator */
    initializedArgs(key, obj, sep="=") {
        if (obj.hasOwnProperty("properties")) {
            return `{${Object.keys(obj["properties"]).map(k => this.initializedArgs(k, obj["properties"][k], sep)).join(",")}}`;
        }
        let val = "";
        if (obj["default"]) {
            // Check type of default with 'type'
            if (obj.hasOwnProperty("type") && typeof obj.default !== obj.type) {
                console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
            }
            if (obj["type"] === "string") {
                val = `"${obj.default}"`;
            } else {
                val = obj.default;
            }
        } else if (obj["type"]) {
            switch(obj["type"]) {
            // Primitive Types
            case "string":  val = "\"\"";   break;
            case "number":
            case "integer": val = "0";      break;
            case "boolean": val = "false";  break;
            case "array":   val = "[]";     break;
            case "object":  val = "{}";     break;
            }
        } else if (obj["$ref"]) {
            // const schemaName = obj["$ref"];
            // if (spec.schemas[schemaName]) {
            //     val = this.initializedArgs(schemaName, spec.schemas[schemaName], ":");
            // } else {
            // console.error(`error: schema "${schemaName}" not found`);
            val = "{}";
            // }
        }
        return `${key}${sep}${val}`;
    },

    /** Comma Separated Properties */
    CSP(obj) {
        return `${Object.keys(obj.properties).join(", ")}`;
    },

    keyTypePairs(key, schema) {
        if (schema.hasOwnProperty("properties")) {
            return `{${Object.keys(schema["properties"]).map(k => this.keyTypePairs(k, schema["properties"][k])).join(",")}}`;
        }

        const json = setTypes(key, schema);
        return Object.keys(json).map(k => {
            let prefix = "";
            // if first char is UpperCase
            if (!isPrimitiveType(json[k])) {
                prefix = config.types_prefix + ".";
            }
            let result = `${k}: ${prefix}${json[k]}`;
            // Deal with arrays
            if (json[key] === key) {
                result += "[]";
            }
            return result;
        })
            .join(", ");
    },

    /** Comma Separated Types */
    CST(key, schema) {
        if (schema.hasOwnProperty("properties")) {
            return `${Object.keys(schema["properties"]).map(k => this.CST(k, schema["properties"][k])).join(",")}`;
        }

        const json = setTypes(key, schema);
        return Object.keys(json).map(k => {
            let prefix = "";
            // if first char is UpperCase
            if (json[k].charAt(0).toUpperCase() === json[k].charAt(0)) {
                prefix = config.types_prefix + ".";
            }

            let result = `${prefix}${json[k]}`;
            // Deal with arrays
            if (json[key] === key) {
                result += "[]";
            }
            return result;
        })
            .join(", ");
    },
};

function setTypes(key, schema) {
    if (schema["type"]) {
        if (schema["type"] === "array") {
            if (schema["items"]["$ref"]) {
                return {[key]: schema["items"]["$ref"].split(".")[0] + "[]"};
            }
            if (schema["items"]["type"]) {
                return {[key]: schema["items"]["$type"] + "[]"};
            }
        }
        return {[key]: schema["type"]};
    }
    if (schema["$ref"]) {
    // More work need to be done here... maybe?
        return {[key]: schema["$ref"].split(".")[0]};
    }
    if (schema["properties"]) {
        let obj = schema["properties"];
        obj = Object.keys(obj)
            .map(k => setTypes(k, obj[k]))
            .reduce((a, b) => Object.assign(a, b), {});
        return obj;
    }
}

function isPrimitiveType(keyword) {
    return [
        "number",
        "string",
        "boolean",
    ].includes(keyword);
}
/**
 * javascript-utils.js provides helper functions used for javascript generators specifically
 */

const semantics = require("../../semantics");

module.exports = ({config}) => ({

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
        return `${Object.keys(obj["properties"]).join(", ")}`;
    },

    /** Key-Type Pairs */
    KTP(key, schema) {
        if (schema["properties"]) {
            return Object.keys(schema["properties"]).map(k => this.KTP(k, schema["properties"][k]));
        }

        const obj = semantics.KTP(key, schema);
        return Object.keys(obj).map(k => {
            let result = `${k}: ${this.convertType(obj[k])}`;
            // Deal with arrays
            if (obj[key] === key) {
                result += "[]";
            }
            return result;
        }).join(", ");
    },

    /** Comma Separated Types */
    CST(key, schema) {
        // console.log("key", key);
        // console.log("schema", schema);
        // if (schema.hasOwnProperty("properties")) {
        //     return `${Object.keys(schema["properties"]).map(k => this.CST(k, schema["properties"][k])).join(",")}`;
        // }

        const json = semantics.KTP(key, schema);
        return Object.keys(json).map(k => {
            let result = this.convertType(json[k]);
            // Deal with arrays
            if (json[key] === key) {
                result += "[]";
            }
            return result;
        })
            .join(", ");
    },

    convertType(t) {
        switch(t) {
        case "number":
        case "integer":
            return "number";
        case "string":
            return "string";
        case "boolean":
            return "boolean";
        }
        return config.typesPrefix + "." + t;
    },
});
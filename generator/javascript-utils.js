const spec = require("../spec");

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
};
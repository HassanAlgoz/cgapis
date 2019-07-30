module.exports = {

    /** destructured object argument with initial values set with an assignment operator */
    initializedArgs(key, obj) {
        if (obj.hasOwnProperty("properties")) {
            return `{${Object.keys(obj["properties"]).map(k => this.initializedArgs(k, obj["properties"][k])).join(",")}}`;
        }
        let val = "";
        if (obj["default"]) {
            // Check type of default with 'type'
            if (obj.hasOwnProperty("type") && typeof obj.default !== obj.type) {
                console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
            }
            val = `${obj.default}`;
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
            val = "{}";
        }
        return `${key}=${val}`;
    },

    /** Comma Separated Properties */
    CSP(obj) {
        return `${Object.keys(obj.properties).join(", ")}`;
    },

    /** destructured object argument with initial values set with the ":" assignment operator */
    initializedObject(key, obj) {
        if (obj.hasOwnProperty("properties")) {
            return `{${Object.keys(obj["properties"]).map(k => this.initializedObject(k, obj["properties"][k])).join(",")}}`;
        }
        let val = "";
        if (obj["default"]) {
            // Check type of default with 'type'
            if (obj.hasOwnProperty("type") && typeof obj.default !== obj.type) {
                console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
            }
            val = `${obj.default}`;
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
            val = "{}";
        }
        return `${key}:${val}`;
    },
};
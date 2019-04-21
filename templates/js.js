module.exports = function() {
    return {

        initObjectValues(key, obj, refs) {
            if (obj.hasOwnProperty('properties')) {
                return `{${Object.keys(obj['properties']).map(k => this.initObjectValues(k, obj['properties'][k], refs)).join(',')}}`
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
        },

        /** Comma Separated Properties */
        CSP(obj) {
            return `${Object.keys(obj.properties).join(", ")}`;
        },
    };
};
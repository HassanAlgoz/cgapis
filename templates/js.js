module.exports = function({typesPrefix}) {
    return {

        keyTypePairs(key, schema) {
            const json = setTypes(key, schema);
            return Object.keys(json).map(k => {
                let prefix = "";
                // if first char is UpperCase
                if (!isPrimitiveType(json[k])) {
                    prefix = typesPrefix + ".";
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
            const json = setTypes(key, schema);
            return Object.keys(json).map(k => {
                let prefix = "";
                // if first char is UpperCase
                if (json[k].charAt(0).toUpperCase() === json[k].charAt(0)) {
                    prefix = typesPrefix + ".";
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

        defaultParameters(obj) {
            return `{${Object.keys(obj).map(key => {
                let val = obj[key];
                if (typeof val === "string") {
                    val = `"${val}"`;
                } else if (Array.isArray(val)) {
                    val = `[${[val.join(",")]}]`;
                }
                return `${key}=${val}`;
            })
                .join(", ")}}`;
        },

        /** Comma Separated Properties */
        CSP(obj) {
            return `${Object.keys(obj.properties).join(", ")}`;
        },

        defaultReturn(obj) {
            return `{
            ${Object.keys(obj).map(key => {
        let val = obj[key];

        if (typeof val === "string") {
            val = `"${val}"`;
        } else if (Array.isArray(val)) {
            val = `[${[val.join(",")]}]`;
        }
        return `${key}: ${val}`;
    })
        .join(",\n")}
        }`;
        },
    };
};

function setTypes(key, schema) {
    if (schema["type"]) {
        if (schema["type"] === "array") {
            if (schema["items"]["$ref"]) {
                return {[key]: schema["items"]["$ref"] + "[]"};
            }
            if (schema["items"]["type"]) {
                return {[key]: schema["items"]["$type"] + "[]"};
            }
        }
        return {[key]: schema["type"]};
    }
    if (schema["$ref"]) {
    // More work need to be done here... maybe?
        return {[key]: schema["$ref"]};
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

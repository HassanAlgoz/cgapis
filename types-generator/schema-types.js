const json = {
    "properties": {
        "skip":    { "type": "number" },
        "limit":   { "type": "number" },
        "context": { "$ref": "Context" },
        "users":   {
            "type":  "array",
            "items": {
                "$ref": "User",
            },
        },
    },
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

console.log(setTypes("req", json));

module.exports = setTypes;
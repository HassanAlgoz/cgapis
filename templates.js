module.exports = {
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

    objDefaultParameters(obj) {
        return `_obj={${Object.keys(obj).map(key => {
            let val = obj[key];

            if (typeof val === "string") val = `"${val}"`;
            else if (Array.isArray(val)) val = `[${[val.join(",")]}]`;

            return `${key}:${val}`;
        })
            .join(", ")}}`;
    },

    destructuring(obj) {
        return `{${Object.keys(obj).join(", ")}}`;
    },

    defaultReturn(obj) {
        return `{
            ${Object.keys(obj)
        .map(key => {
            let val = obj[key];

            if (typeof val === "string") val = `"${val}"`;
            else if (Array.isArray(val)) val = `[${[val.join(",")]}]`;

            return `${key}: ${val}`;
        })
        .join(",\n")}
        }`;
    },

    initializeObj(schema, types) {
        const obj = {};
        for(const key in schema) {
            // Assign the default
            if (schema[key].default) {
                // Check type of default with 'type'
                if (typeof schema[key].default !== schema[key].type) {
                    console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
                    continue;
                }
                obj[key] = schema[key].default;
            } else {
                // If no default, assign the zero of the type
                switch(schema[key].type) {
                // Primitive Types
                case "string": obj[key] = ""; break;
                case "number": obj[key] = 0; break;
                case "boolean": obj[key] = false; break;
                case "array": obj[key] = []; break;
                case "object": {
                    // the "zero object" is undefined/nothing, thus the variable is ommited
                } break;

                default: {
                    // Custom Types
                    const customType = types[schema[key].type];
                    if (customType) {
                        return this.initializeObj(customType);
                    }
                    // Type not found error
                    console.error(`TypeError: "${schema[key].type}" doesn't exists`);
                }
                }
            }
        }
        return obj;
    },
};


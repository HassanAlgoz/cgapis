/**
 * config.js provides helper functions used across all types of generators (not specific to any language)
 */
const self = {

    isGet: (methodName) => [
        "get",
        "find",
        "list",
        "fetch",
        "search",
        "probe",
        "peek",
        "has",
        "have",
        "is",
    ].some(s => {
        self.splitCamelCase(methodName)[0]
            .toLowerCase()
            .startsWith(s);
    }),

    isPost: (methodName) => !self.isGet(methodName),

    KTP(key, schema) {

        if (schema["type"]) {
            switch(schema["type"]) {

            case "array": {
                return self.KTP(key, schema["items"]);
            }

            case "object": {
                return Object.keys(schema["properties"])
                    .map(k => self.KTP(k, schema["properties"][k]))
                    .reduce((a, b) => Object.assign(a, b), {});
            }
            }
            return {[key]: schema["type"]};
        }

        // More work need to be done here... maybe?
        if (schema["$ref"]) {

            let type = schema["$ref"]; // Default

            if (schema["$ref"].indexOf("/") !== -1) {
                const parts = schema["$ref"].split("/");
                type = parts[parts.length - 1];
            }

            if (schema["$ref"].indexOf(".") !== -1) {
                const parts = schema["$ref"].split(".");
                type = parts[0];
            }

            return {[key]: type};
        }
    },

    isPrimitiveType(keyword) {
        return [
            "number",
            "string",
            "boolean",
        ].includes(keyword);
    },

    splitCamelCase(camelCaseString="") {

        const indexes = (() => {
            const result = [];
            // get split indexes, which are:
            // non-uppercase followed by an uppercase

            for(let i = 0; i < camelCaseString.length - 1; i++) {
                const [a, b] = [camelCaseString[i], camelCaseString[i+1]];
                if (!isUpperCase(a) && isUpperCase(b)) {
                    result.push(i);
                }
            }
            result.push(camelCaseString.length - 1);
            return result;

            function isUpperCase (char) {
                let charCode = char.charCodeAt(0);
                return charCode >= 65 && charCode <= 90;
            }
        })();

        const slices = [];
        let k = 0;
        for(let i = 0; i < camelCaseString.length; i++) {
            if (indexes.includes(i)) {
                slices.push( camelCaseString.slice(k, i+1) );
                k = i+1;
            }
        }
        return slices;
    },
};

module.exports = self;
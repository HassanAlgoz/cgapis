/**
 * `typescript.js` generates typescript interfaces from JSON Schemas
 */

const {compile} = require("json-schema-to-typescript");

const config = require("../config");
const spec = require("../spec");

let returnValue = null;

async function generate() {
    if (returnValue) {
        return returnValue;
    }

    const result = [];
    const promises = [];

    for(const sKey in spec.schemas) {
        const schema = spec.schemas[sKey];
        promises.push(compile(schema, sKey, {
            bannerComment:    false,
            enableConstEnums: true,
            cwd:              config.schemas_dir,
            style:            {
                parser:        "typescript",
                tabWidth:      4,
                trailingComma: "all",
                semi:          true,
            },
        }));
    }

    try {
        for await(const p of promises) {
            result.push(p);
        }
    } catch (err) {
        console.error(err);
    }

    returnValue = result.join("\n");
    return returnValue;
}


module.exports = generate;
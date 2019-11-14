/**
 * Generates typescript interfaces from JSON Schemas
 */

const {compile} = require("json-schema-to-typescript");

module.exports = ({schemas, schemasDir}) => ({

    async generate() {
        const result = [];
        const promises = [];

        for(const sKey in schemas) {
            const schema = schemas[sKey];
            promises.push(compile(schema, sKey, {
                bannerComment:    false,
                enableConstEnums: true,
                cwd:              schemasDir,
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

        return result.join("\n");
    },

});
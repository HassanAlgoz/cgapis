const {compile} = require("json-schema-to-typescript");
const fs = require("fs");
const path = require("path");

const config = require("../config");
const spec = require("../spec");

async function generate() {
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

    fs.writeFile(path.join(config.server_dir, "/api", "types.ts"), result.join("\n"), { encoding: "utf8" }, (err) => {
        if (err) return console.error(err);
    });
    fs.writeFile(path.join(config.client_dir, "types.ts"), result.join("\n"), { encoding: "utf8" }, (err) => {
        if (err) return console.error(err);
    });
}


module.exports = generate;
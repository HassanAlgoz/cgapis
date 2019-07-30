const fs = require("fs");
const path = require("path");

const config = require("./config");

const schemas = {};
fs.readdirSync(config.schemas_dir)
    .forEach(fileName => {
        const raw = fs.readFileSync(path.join(config.schemas_dir, fileName)).toString();
        const schemaName = fileName.split(".")[0];
        schemas[schemaName] = JSON.parse(raw);
    });

const services = {};
fs.readdirSync(config.services_dir)
    .forEach(fileName => {
        const raw = fs.readFileSync(path.join(config.services_dir, fileName)).toString();
        const serviceName = fileName.split(".")[0];
        services[serviceName] = JSON.parse(raw);
    });

for(const sKey in schemas) {
    schemas[sKey]["$id"] = path.join(config.schemas_uri, `/${sKey}.schema.json`);
    schemas[sKey]["title"] = sKey;
}

for (const sKey in services) {
    const serv = services[sKey];
    const ops = services[sKey][sKey];

    for(const oKey in ops) {

        const op = ops[oKey];
        // Add "$id" to service ops' req and res
        // op["req"]["$id"] = `${sKey}.${oKey}.req`
        // op["res"]["$id"] = `${sKey}.${oKey}.res`
        // Add '"type": "object"' to service ops' req and res
        // op["req"]["type"] = "object"
        // op["res"]["type"] = "object"

        // Add Status to every response
        if (!op["res"]) {
            op["res"] = {
                "type":       "object",
                "properties": {},
            };
        }
        op["res"]["properties"] = {
            "status": { "$ref": "Status" },
            "data":   {
                "type":       "object",
                "properties": op["res"]["properties"],
            },
        };
        // console.log(op["res"]["properties"]);

        // Add "$schema" to service ops' req and res
        // op.req["$schema"] = "http://json-schema.org/draft-07/schema"
        // op.res["$schema"] = "http://json-schema.org/draft-07/schema"
    }

    // Add the mandatory "$id" property to the refs object
    // serv["refs"]["$id"] = "refs"
    // Add "$id" to refs
    // for(const key in serv["refs"]) {
    //     serv["refs"][key]["$id"] = key
    // }


}

module.exports = {
    schemas,
    services,
};

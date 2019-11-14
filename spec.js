/**
 * spec.js means specification. It exports `{schemas, services}` after reading and parsing
 * `/api-schemas` and `/api-services`
 */

const fs = require("fs");
const path = require("path");

module.exports = (specConfig) => {
    console.log("parsing services...");
    const services = parseServices(specConfig);
    console.log("done parsing services");

    console.log("parsing schemas...");
    const schemas = parseSchemas(specConfig);
    console.log("done parsing schemas");

    return {services, schemas};
    // return () => Object.entries(services).map(s => {
    //     Object.entries(s["properties"]).map(o => {
    //         return o["properties"];
    //     });
    //     return s["properties"];
    // });
};


function parseServices(specConfig) {
    const services = {};
    // Parse Services
    fs.readdirSync(specConfig.servicesDir)
        .forEach(fileName => {
            const serviceName = fileName.split(".")[0];
            const raw = fs.readFileSync(path.join(specConfig.servicesDir, fileName)).toString();
            services[serviceName] = JSON.parse(raw);
        });

    for (const sKey in services) {
        for(const oKey in services[sKey]["properties"]) {
            const op = services[sKey]["properties"][oKey]["properties"];

            if (!op.req) op.req = {};
            if (!op.res) op.res = {};
            if (!op.error) op.error = {};
            if (!op.auth) op.auth = {};

            parseRequest(op);
            parseResponse(op);
            parseError(op);
            parseAuth(op);

            // Add "$id" to service ops' req and res
            op["req"]["$id"] = `${sKey}_${oKey}_req`;
            op["res"]["$id"] = `${sKey}_${oKey}_res`;
            // op["error"]["$id"] = `${sKey}.${oKey}.error`;
            // op["auth"]["$id"] = `${sKey}.${oKey}.auth`;
        }
        // for(const dKey in services[sKey]["definitions"]) {
        //     services[sKey]["definitions"]["title"] = dKey;
        // }
    }

    function parseRequest(op) {

    }

    function parseResponse(op) {
        // Add Status to every response
        if (isEmpty(op["res"])) {
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
    }

    function parseError(op) {
        // Add default errors to every response
        if (isEmpty(op["error"])) {
            op["error"] = {
                "oneOf": [],
            };
        }
        for(const err of specConfig.defaultErrors) {
            op["error"]["oneOf"].push(
                { "type": "string", "const": err }
            );
        }
        // if (op["auth"]) {
        //     for(const err of authErrors) {
        //         op["error"]["oneOf"].push(
        //             { "type": "string", "const": err }
        //         );
        //     }
        // }
    }

    function parseAuth(op) {

    }

    return services;
}

function parseSchemas(specConfig) {
    const schemas = {};

    // Parse Schemas
    fs.readdirSync(specConfig.schemasDir)
        .forEach(fileName => {
            const raw = fs.readFileSync(path.join(specConfig.schemasDir, fileName)).toString();
            const schemaName = fileName.split(".")[0];
            schemas[schemaName] = JSON.parse(raw);
        });

    for(const sKey in schemas) {
        schemas[sKey]["$id"] = path.join(specConfig.schemasURI, `/${sKey}.schema.json`);
        schemas[sKey]["title"] = sKey;
        // if (typeof schemas[sKey]["additionalProperties"] === "undefined") {
        //     schemas[sKey]["additionalProperties"] = false;
        // }
    }

    return schemas;
}

function isEmpty(obj) {
    if (!obj) return true;
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}
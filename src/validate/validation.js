const Ajv = require("ajv");

const json = {
    "services": {
        "User": {
            "ops": {
                "getUsersList": {
                    "req": {
                        "properties": {
                            "skip":    { "type": "number" },
                            "limit":   { "type": "number" },
                            "context": { "$ref": "Context" },
                        },
                    },
                    "res": {
                        // "type":       "object",
                        "properties": {
                            "status": { "$ref": "Status" },
                            "users":  {
                                "type":  "array",
                                "items": {
                                    "$ref": "User",
                                },
                            },
                        },
                    },
                },
            },
        },
    },

    "refs": {
        "User": {
            // "type":       "object",
            "properties": {
                "email":    { "type": "string", "format": "email" },
                "password": { "type": "string", "minLength": 6 },
                "age":      { "type": "integer", "minimum": 1 },
            },
        },
        "Status": {
            "properties": {
                "code": {
                    "type": "string",
                    "enum": [
                        "OK",
                        "UNAVAILABLE",
                        "UNIMPLEMENTED",
                        "UNAUTHORIZED",
                        "UNAUTHENTICATED",
                        "INVALID_PARAMETERS",
                        "UNKNOWN",
                    ],
                },
                "errors": {
                    "type":  "array",
                    "items": { "type": "string" },
                },
            },
        },
        "Context": {
            "type": "string",
            "enum": [
                "list",
                "details",
                "CRUD-table",
            ],
        },
    },
};

const refs = json.refs;
// Add the "$id" property that is used as a value to "$ref"
for(const key in refs) {
    refs[key]["$id"] = key;
}
// Add the mandatory "$id" property to the refs object
refs["$id"] = "refs";

// let schema = json.services.User.ops.getUsersList.res.ok;
// const data = {
//     users:  [
//         {
//             "email":    "asdf",
//             "password": "123",
//         },
//     ],
// };
const ajv = new Ajv({
    allErrors: true, // check all rules collecting all errors.
    schemas:   [refs],
});

const reqSchema = json.services.User.ops.getUsersList.req;
const data = {
    skip:    "",
    limit:   "",
    context: "",
};

const validate  = ajv.compile(reqSchema);


if (!validate(data)) {
    const errors = [];
    // console.log(validate.errors);
    for(const err of validate.errors) {
        const dataPath = err.dataPath.substring(1);
        if (err.keyword === "enum") {
            const enumValues = err.params.allowedValues.map(v => `"${v}"`).join(", ");
            errors.push(dataPath + " " + err.message + ": " + enumValues);
            continue;
        }
        errors.push(dataPath + " " + err.message);
    }
    console.log(errors.join("\n"));

} else {
    console.log("OK");
}


// const schema = {
//     type:       "object",
//     properties: {
//         name: { type: "string" },
//         age:  { type: "number" },
//     },
// };
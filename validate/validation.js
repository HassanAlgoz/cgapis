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
                            "context": {
                                "type": "string",
                                "enum": ["adminTable", "searchPage"],
                            },
                        },
                    },
                    "res": {
                        "ok": {
                            // "type":       "object",
                            "properties": {
                                "message": { "type": "string" },
                                "users":   {
                                    "type":  "array",
                                    "items": {
                                        "$ref": "User",
                                    },
                                },
                            },
                        },
                        "fail": {
                            "properties": {
                                "message": { "type": "string" },
                                "error":   {
                                    "type": "string",
                                    "enum": ["noUsersExist", "noUsersLeft"],
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
    },
};

// {schemas: [json.refs]}
// ajv.addMetaSchema(require("ajv/lib/refs/json-schema-draft-06.json"));
const ajv = new Ajv({
    allErrors: true,
});

let refs = json.refs;
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

let schema = json.services.User.ops.getUsersList.req;
const data = {
    skip:    "",
    limit:   "",
    context: "",
};

const validate  = ajv.addSchema(refs).compile(schema);


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
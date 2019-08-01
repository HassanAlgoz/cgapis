const Ajv = require("ajv");
const parser = require("../parser/json");

const rawJson = {};

const json = parser.parse(rawJson);
// console.log(json.services.User.ops.getUsersList)
// console.log("json:", JSON.stringify(json))
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
    schemas:   [json.refs],
});

const reqSchema = json.services.User.ops.getUsersList.req;
const data = {
    skip:    "",
    limit:   "",
    context: "",
};

const validate  = ajv.compile(reqSchema);

// console.log(ajv.getSchema("User.getUsersList.req").refs)

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
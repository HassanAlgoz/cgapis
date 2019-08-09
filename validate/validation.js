const Ajv = require("ajv");

const spec = require("../spec");

const ajv = new Ajv({
    allErrors: true, // check all rules collecting all errors.
    schemas:   [spec.schemas],
});

const reqSchema = spec.services.Course.Course.getList.req;
const data = {
    skip:    0,
    limit:   "",
    context: "",
};
console.log("schema:", reqSchema);
console.log("data:", data);

const validate  = ajv.compile(reqSchema);

if (!validate(data)) {
    const errMap = {};
    // console.log(validate.errors);
    for(const err of validate.errors) {
        const dataPath = err.dataPath.substring(1);
        if (err.keyword === "enum") {
            const enumValues = err.params["allowedValues"].map(v => `"${v}"`).join(", ");
            errMap[dataPath] = err.message + ": " + enumValues;
            continue;
        }
        errMap[dataPath] = err.message;
    }
    console.log("errMap:", errMap);
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
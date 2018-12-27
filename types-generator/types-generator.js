// import { compile } from 'json-schema-to-typescript'
const {compile} = require("json-schema-to-typescript");

async function generate(refs) {
    let result = [];
    let promises = [];
    for(const r in refs) {
        refs[r].title = r;
        // refs[r].id = r;
        promises.push(compile(refs[r], r, {
            bannerComment: false,
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
}


module.exports = generate;
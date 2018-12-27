const fs = require("fs");
module.exports = {
    parse(src) {
        let json = JSON.parse(src);
        return json;
        // return {
        //     version:  json.version,
        //     services: json.services,
        //     refs:     json.refs,
        // };
    },
    parseFile(filePath) {
        return this.parse(fs.readFileSync(filePath));
    },
};
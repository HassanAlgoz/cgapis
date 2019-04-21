const fs = require("fs");
module.exports = {
    parse(src) {
        let json = JSON.parse(src);
        return json;
    },
    parseFile(filePath) {
        return this.parse(fs.readFileSync(filePath));
    },
};
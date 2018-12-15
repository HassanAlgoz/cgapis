const fs = require("fs");
module.exports = {
    parse(src) {
        let json = JSON.parse(src);
        return {
            version:  json.version,
            services: json.services,
            types:    json.types,
        };
    },
    parseFile(filePath) {
        return this.parse(fs.readFileSync(filePath));
    },
};
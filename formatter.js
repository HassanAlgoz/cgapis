const prettier = require("prettier");
module.exports = function() {
    return {
        format(src) {
            return prettier.format(src, {
                parser:        "typescript",
                tabWidth:      4,
                trailingComma: "all",
                semi:          true,
            });
        },
    };
};
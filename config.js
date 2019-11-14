/**
 * config.js is the configuration exported as `config`
 */

const path = require("path");

module.exports = (params) => {

    // Spec Defaults
    const spec = {
        endpoint:    "/api",
        servicesDir: path.join(process.cwd(), "/api-services"),
        schemasDir:  path.join(process.cwd(), "/api-schemas"),
        schemasURI:  "https://example.com/schemas",

        defaultErrors: [
            "OK",
            "NotImplemented",
            "NotFound",
            "InvalidParameters",
        ],

        authErrors: {
            authentication: "AuthenticationRequired",
            authorization:  "AuthorizationRequired",
        },
    };

    // Client Defaults
    const client = {
        languageAndFramework: "javascript-axios-ts",
        outputDir:            path.join(process.cwd(), "/generated-client"),
    };

    // Server Defaults
    const server = {
        languageAndFramework: "javascript-express-ts", // empty string means no server
        outputDir:            path.join(process.cwd(), "/generated-server"),
    };

    return {
        spec,
        client,
        server,
    };
};
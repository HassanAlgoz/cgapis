const path = require("path");

module.exports = {
    server_dir:       path.join(process.cwd(), "/generated-server"),
    client_dir:       path.join(process.cwd(), "/generated-client"),
    schemas_dir:      path.join(process.cwd(), "/api-schemas"),
    services_dir:     path.join(process.cwd(), "/api-services"),
    api_relative_url: "/api/v1",
    client_lang:      "typescript-axios",
    server_lang:      "typescript-express",
    schemas_uri:      "https://example.com/schemas",

    types_prefix: "Type",
};
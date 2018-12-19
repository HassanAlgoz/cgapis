const path = require("path");
const config = {
    server_dir:    path.join(__dirname, "/server"),
    client_dir:    path.join(__dirname, "/client"),
    services_file:  path.join(__dirname, "/api.json"),
    api_path:       "/api/v1",
};
module.exports = config;
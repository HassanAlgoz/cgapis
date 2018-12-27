const path = require("path");
const config = {
    server_dir:    path.join(__dirname, "/output/server"),
    client_dir:    path.join(__dirname, "/output/client"),
    api_spec_file: path.join(__dirname, "/data/api.json"),
    api_path:      "/api/v1",
};
module.exports = config;
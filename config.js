const path = require('path');
const config = {
    server_api_dir: path.join(__dirname, '/server/api'),
    client_api_dir: path.join(__dirname, '/client/api'),
    services_file:  path.join(__dirname, '/services.json'),
    api_path:       '/api/v1',
};
module.exports = config;
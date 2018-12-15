const path = require('path');
const config = {
    server_api_dir: path.join(__dirname, '/server'),
    client_api_dir: path.join(__dirname, '/client'),
    services_file:  path.join(__dirname, '/services.json'),
    api_path:       '/api/v1',

    prettier: {
        parser:        'typescript',
        tabWidth:      4,
        trailingComma: 'all',
        semi:          true,
    },
};
module.exports = config;
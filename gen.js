const ServiceGenerator = require('./ServiceGenerator');

const utils = require('./utils');

const fs = require('fs-extra');
const path = require('path');
const djv = require('djv');

// Config
const config = require('./config');

function main() {
    console.log('Generating...');
    fs.ensureDirSync(config.server_api_dir);
    fs.ensureDirSync(config.client_api_dir);

    const gen = new ServiceGenerator({
        servicesFile: config.services_file,
        apiPath:      config.api_path,
        clientDir:    config.client_api_dir,
        serverDir:    config.server_api_dir,
    });
    gen.start();
    console.log('Done');
}
main();

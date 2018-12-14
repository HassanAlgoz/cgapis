const ServiceGenerator = require('./ServiceGenerator');

const utils = require('./utils');

const fs = require('fs');
const path = require('path');
const djv = require('djv');

// Config
const config = require('./config');


// NOTE: WORKS ON WINDOWS!
function cdDotDot(dirPath) {
    let arr = dirPath.split('\\');
    return arr[arr.length - 2];
}

function main() {

    if (!fs.existsSync(cdDotDot(config.server_api_dir))) {
        fs.mkdirSync(cdDotDot(config.server_api_dir));
    }
    if (!fs.existsSync(config.server_api_dir)) {
        fs.mkdirSync(config.server_api_dir);
    }
    if (!fs.existsSync(cdDotDot(config.client_api_dir))) {
        fs.mkdirSync(cdDotDot(config.client_api_dir));
    }
    if (!fs.existsSync(config.client_api_dir)) {
        fs.mkdirSync(config.client_api_dir);
    }

    const gen = new ServiceGenerator({
        servicesFile: config.services_file,
        apiPath:          config.api_path,
        clientDir:        config.client_api_dir,
        serverDir:        config.server_api_dir,
    });
    gen.start();

    utils.formatDir(config.server_api_dir);
    utils.formatDir(config.client_api_dir);
    console.log('Done');
}
main();

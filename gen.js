const fs = require('fs-extra');
const path = require('path');
const djv = require('djv');

// Config
const config = require('./config');

const ServiceGenerator = require('./ServiceGenerator');

function main() {
    console.log('Generating Services...');
    fs.ensureDirSync(config.server_dir);
    fs.ensureDirSync(config.client_dir);

    const gen = new ServiceGenerator({
        servicesFile: config.services_file,
        apiPath:      config.api_path,
        clientDir:    config.client_dir,
        serverDir:    config.server_dir,
    });
    gen.start();

    console.log('Writing express server template');
    fs.copyFileSync(
        path.join(__dirname, 'templates', 'express', 'server.js'),
        path.join(config.server_dir, 'server.js')
    );

    console.log('Done');
}
main();

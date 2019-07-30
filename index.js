#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const config = require("./config");
const spec = require("./spec");

require("./cmd");

async function main() {
    // 1. Read Configuration File -----------------------------------------------------------------
    console.log("config:-\n", config);
    // 2. Ensure directories exist
    fs.ensureDirSync(path.join(config.server_dir, "/api"));
    fs.ensureDirSync(config.client_dir);
    // 3. Parse Schema File -----------------------------------------------------------------------
    // 4. Validate Schema -------------------------------------------------------------------------
    // @Todo: Validate Schema
    // 5. Generate Code ---------------------------------------------------------------------------
    // 5.1 Client Code
    (function() {
        let generator = null;
        switch(config["client_lang"].toLowerCase()) {
        case "javascript-axios": {
            generator = require("./generator/javascript-axios");
        } break;
        }
        generator.generate({
            spec,
            outputDir: config.client_dir,
        });
    })();

    // 5.2 Server Code
    (function() {
        let generator = null;
        switch(config["server_lang"].toLowerCase()) {
        case "javascript-express": {
            generator = require("./generator/javascript-express");
        } break;
        }
        generator.generate({
            spec,
            outputDir:      config.server_dir,
            apiRelativeURL: config.api_relative_url,
        });
    })();

    // 6 Generate Types
    const tgen = require("./types-generator/types-generator");
    await tgen();
}
main();


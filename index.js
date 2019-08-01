#!/usr/bin/env node
/**
 * index.js is the main file
 * it is where the program starts from
 */
const fs = require("fs");

const config = require("./config");

require("./spec");
require("./cmd");

function generate(mod) {
    try {
        const generator = require(mod);
        generator.generate();
    } catch (err) {
        if (err.code === "MODULE_NOT_FOUND") {
            console.error(`Generator not found: "${mod}"`);
        } else {
            console.error(err);
        }
    }
}

async function main() {
    console.log("config:-\n", config);

    fs.mkdir(config.client_dir, (err) => {
        if (err && err.code !== "EEXIST") return console.error(err);
    });
    fs.mkdir(config.server_dir, (err) => {
        if (err  && err.code !== "EEXIST") return console.error(err);
    });

    if (config.client_lang) {
        generate("./generator/client/" + config.client_lang);
    }
    if (config.server_lang) {
        generate("./generator/server/" + config.server_lang);
    }
}
main();


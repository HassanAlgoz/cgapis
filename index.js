#!/usr/bin/env node
/**
 * index.js is the main file
 * it is where the program starts from
 */
const path = require("path");
const fs = require("fs");

function main() {
    const params = require("./cmd");
    console.log("reading configuration...");
    const config = require("./config")(params);
    // console.log("config:-\n", config);

    console.log("parsing spec...");
    const {services, schemas} = require("./spec")(config.spec);

    console.log("starting generators...");
    startGenerators(config, services, schemas);
}
try {
    main();
} catch(err) {
    console.error(err);
}


function startGenerators(config, services, schemas) {

    if (config.client.outputDir && config.client.languageAndFramework) {
        fs.mkdir(config.client.outputDir, (err) => {
            if (err && err.code !== "EEXIST") return console.error(err);
            // Select client generator and run it
            const generatorPath = locateLanguage(config.client.languageAndFramework, "client");
            generate(config, services, schemas, generatorPath);
        });
    }

    if (config.server.outputDir && config.server.languageAndFramework) {
        fs.mkdir(config.server.outputDir, (err) => {
            if (err  && err.code !== "EEXIST") return console.error(err);
            // Select server generator and run it
            const generatorPath = locateLanguage(config.server.languageAndFramework, "server");
            generate(config, services, schemas, generatorPath);
        });
    }
}


async function generate(config, services, schemas, generatorPath) {
    try {
        const generator = require(generatorPath);
        generator({config, services, schemas}).generate();
    } catch (err) {
        if (err.code === "MODULE_NOT_FOUND") {
            console.error(`Generator not found: "${generatorPath}"`);
        } else {
            console.error(err);
        }
    }
}

function locateLanguage(str, clientOrServer="server") {
    const split = str.split("-");
    const language = split.shift();
    const framework = split.join("-");
    return path.join(__dirname, "generators", language, clientOrServer, framework) + ".js";
}
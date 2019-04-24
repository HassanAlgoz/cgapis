#!/usr/bin/env node

const fs = require("fs-extra");
const path = require("path");

const parser = require("./parser/parser");
const clientGen = require("./client-generator");
const serverGen = require("./server-generator");

async function main() {

    // 1. Read Configuration File -----------------------------------------------------------------
    const config = require("./config");
    console.log("config:-\n", config);
    // 2. Ensure directories exist
    fs.ensureDirSync(path.join(config.server_dir, "/api"));
    fs.ensureDirSync(config.client_dir);
    // 3. Parse Schema File -----------------------------------------------------------------------
    const spec = parser.parse(fs.readFileSync(config.api_spec_file));
    // 4. Validate Schema -------------------------------------------------------------------------
    // @Todo: Validate Schema
    // 5. Generate Code ---------------------------------------------------------------------------
    // 5.1 Client Code
    await clientGen({config, spec}).generateFiles();
    // 5.2 Server Code
    await serverGen({config, spec}).generateFiles();
    fs.copyFileSync(
        path.join(__dirname, "templates", "copies", "express-server.js"),
        path.join(config.server_dir, "server.js")
    );
}
main();


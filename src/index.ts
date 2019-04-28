#!/usr/bin/env node

import * as fs from "fs-extra";
import * as path from "path";

import parser from "./parser/json"
import clientGen from "./generator/client-generator"
import serverGen from "./generator/server-generator"

import {Config} from "./config"

async function main() {

    // 1. Read Configuration File -----------------------------------------------------------------
    const config :Config = require("./config");
    console.log("config:-\n", config);
    // 2. Ensure directories exist
    fs.ensureDirSync(path.join(config.server_dir, "/api"));
    fs.ensureDirSync(config.client_dir);
    // 3. Parse Schema File -----------------------------------------------------------------------
    const spec = parser.parse(fs.readFileSync(config.api_spec_file, {encoding: "utf8"}).toString());
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


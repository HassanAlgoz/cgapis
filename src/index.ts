#!/usr/bin/env node

import * as fs from "fs-extra";
import * as path from "path";

import parser from "./parser/json"

import {Config} from "./config"

// Languages
import Formatter from "./formatter/interface"
import LanguageGenerator from "./generator/interface"
// JS
import languageJavascript from "./generator/javascript"
import formatterJavascript from "./formatter/javascript"

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
    let clientGen :LanguageGenerator;
    let clientFormatter :Formatter;
    switch(config["client_lang"].toLowerCase()) {
        case "js":
        case "javascript": {
            clientGen = languageJavascript()
            clientFormatter = formatterJavascript
        } break;
    }

    (function() {
        const services :object[] = [];
        for(const serviceName in spec.services) {
            const service = spec.services[serviceName];
            const methods :string[] = [];
            for(const opName in service.ops) {
                const op = service.ops[opName];
                const methodCode = clientGen.client.generateRequestMethod(serviceName, opName, op.req, op.res)
                methods.push(methodCode);
            }
            services.push({
                serviceName: serviceName,
                methods:     methods,
            });
        }

        const APICode = clientGen.client.groupServiceOperations(services)
        fs.writeFileSync(
            path.join(config.client_dir, "/api.js"),
            clientFormatter.format(APICode),
            {encoding: 'utf8'});
    })()

    // 5.2 Server Code
    let serverGen :LanguageGenerator;
    let serverFormatter :Formatter;
    switch(config["server_lang"].toLowerCase()) {
        case "js":
        case "javascript": {
            serverGen = languageJavascript()
            serverFormatter = formatterJavascript
        } break;
    }
    (function() {
        const services :object[] = [];
            for(const serviceName in spec.services) {
                const service = spec.services[serviceName];
                const methods :string[] = [];
                const routes :string[] = [];
                for(const opName in service.ops) {
                    const op = service.ops[opName];
                    routes.push(serverGen.server.makeRoute(serviceName, opName, `${config.api_relative_url}/${serviceName}/${opName}`, op.req, op.res));
                    methods.push(serverGen.server.APIMethod(serviceName, opName, op.req, op.res));
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                    routes:      routes,
                });
            }

            const routesCode = serverGen.server.groupServiceRoutes(services);
            const formattedRoutesCode = serverFormatter.format(routesCode)
            fs.writeFileSync(
                path.join(config.server_dir, "/api/routes.js"),
                formattedRoutesCode);

            services.forEach(service => {
                const serviceCode = serverFormatter.format(`
                    ${service["methods"].join("\n\n")}
                `);
                fs.writeFileSync(
                    path.join(config.server_dir, "/api", `/${service["serviceName"]}.js`),
                    serviceCode);
            });
    })()
    fs.copyFileSync(
        path.join(__dirname, "templates", "copies", "express-server.js"),
        path.join(config.server_dir, "server.js")
    );
}
main();


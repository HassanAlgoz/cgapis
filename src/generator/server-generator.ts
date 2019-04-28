import * as fs from "fs";
import * as path from "path";

import {Config} from "../config"
import {SpecSchema} from "../parser/interface"

// Languages
import Formatter from "../formatter/interface"
import LanguageGenerator from "./language/interface"
// JS
import languageJavascript from "./language/javascript"
import formatterJavascript from "../formatter/javascript"

export default function({config, spec} :{config :Config, spec :SpecSchema}) {
    let generator :LanguageGenerator;
    let formatter :Formatter;

    switch(config["server_lang"].toLowerCase()) {
        case "js":
        case "javascript": {
            generator = languageJavascript({config, spec})
            formatter = formatterJavascript
        } break;
    }

    return {
        async generateFiles() {
            const services :object[] = [];
            for(const serviceName in spec.services) {
                const service = spec.services[serviceName];
                const methods :string[] = [];
                const routes :string[] = [];
                for(const opName in service.ops) {
                    const op = service.ops[opName];
                    routes.push(generator.server.makeRoute(serviceName, opName, `${config.api_relative_url}/${serviceName}/${opName}`, op.req, op.res));
                    methods.push(generator.server.APIMethod(serviceName, opName, op.req, op.res));
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                    routes:      routes,
                });
            }

            const routesCode = generator.server.groupServiceRoutes(services);
            const formattedRoutesCode = formatter.format(routesCode)
            fs.writeFileSync(
                path.join(config.server_dir, "/api/routes.js"),
                formattedRoutesCode);

            services.forEach(service => {
                const serviceCode = formatter.format(`
                    ${service["methods"].join("\n\n")}
                `);
                fs.writeFileSync(
                    path.join(config.server_dir, "/api", `/${service["serviceName"]}.js`),
                    serviceCode);
            });
        },
    };
};


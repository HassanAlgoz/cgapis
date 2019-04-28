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
    
    switch(config["client_lang"].toLowerCase()) {
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
                for(const opName in service.ops) {
                    const op = service.ops[opName];
                    const methodCode = generator.client.generateRequestMethod(serviceName, opName, op.req, op.res)
                    methods.push(methodCode);
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                });
            }

            const APICode = generator.client.groupServiceOperations(services)
            fs.writeFileSync(
                path.join(config.client_dir, "/api.js"),
                formatter.format(APICode),
                {encoding: 'utf8'});
        },
    };
};

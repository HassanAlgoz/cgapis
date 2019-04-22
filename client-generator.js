const fs = require("fs");
const path = require("path");
const js = require("./templates/js");

module.exports = function({config, spec}) {
    const jsFormatter = require("./formatter/formatter");
    let lang = null;
    
    switch(config.lang.toLowerCase()) {
        case "js":
        case "javascript": {
            lang = js({config, spec})
            formatter = jsFormatter({config, spec})
        } break;
    }

    return {
        async generateFiles() {
            const services = [];
            for(const serviceName in spec.services) {
                const service = spec.services[serviceName];
                const methods = [];
                for(const opName in service.ops) {
                    const op = service.ops[opName];
                    const methodCode = lang.generateClientRequestMethod(serviceName, opName, op.req, op.res)
                    methods.push(methodCode);
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                });
            }

            const APICode = lang.groupServiceOperations(services)
            const formattedAPICode = formatter.format(APICode)
            fs.writeFileSync(path.join(config.client_dir, "/api.js"), formattedAPICode, {encoding: 'utf8'});
        },
    };
};

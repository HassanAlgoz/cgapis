const fs = require("fs");
const path = require("path");

module.exports = function({config, spec}) {
    let client = null;
    let formatter = null;
    
    switch(config.client_lang.toLowerCase()) {
        case "js":
        case "javascript": {
            client = require("./templates/js")({config, spec}).client
            formatter = require("./formatter/js")({config, spec})
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
                    const methodCode = client.generateRequestMethod(serviceName, opName, op.req, op.res)
                    methods.push(methodCode);
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                });
            }

            const APICode = client.groupServiceOperations(services)
            const formattedAPICode = formatter.format(APICode)
            fs.writeFileSync(path.join(config.client_dir, "/api.js"), formattedAPICode, {encoding: 'utf8'});
        },
    };
};

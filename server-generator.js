const fs = require("fs");
const path = require("path");

module.exports = function({config, spec}) {
    let server = null;
    let formatter = null;

    switch(config.server_lang.toLowerCase()) {
        case "js":
        case "javascript":
        case "node":
        case "nodejs": {
            server = require("./templates/js")({config, spec}).server
            formatter = require("./formatter/js")({config, spec})
        } break;

        // case "go":
        // case "golang": {
        //     server = require("./templates/go")({config, spec}).server
        //     formatter = require("./formatter/go")({config, spec})
        // } break;
    }

    return {
        async generateFiles() {
            const services = [];
            for(const serviceName in spec.services) {
                const service = spec.services[serviceName];
                const methods = [];
                const routes = [];
                for(const opName in service.ops) {
                    const op = service.ops[opName];
                    routes.push(server.makeRoute(serviceName, opName, `${config.api_relative_url}/${serviceName}/${opName}`, op.req, op.res));
                    methods.push(server.APIMethod(serviceName, opName, op.req, op.res));
                }
                services.push({
                    serviceName: serviceName,
                    methods:     methods,
                    routes:      routes,
                });
            }

            const routesCode = server.groupServiceRoutes(services);
            const formattedRoutesCode = formatter.format(routesCode)
            // console.log("routesCode:", routesCode)
            fs.writeFileSync(path.join(config.server_dir, "/api/routes.js"), formattedRoutesCode);

            services.forEach(service => {
                const serviceCode = formatter.format(`
                    ${service.methods.join("\n\n")}
                `);
                fs.writeFileSync(path.join(config.server_dir, "/api", `/${service.serviceName}.js`), serviceCode);
            });
        },
    };
};


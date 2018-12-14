const fs = require('fs');
const path = require('path');
const config = require('./config');
const utils = require('./utils');


function defaultParameters(obj) {
    return `{${Object.keys(obj).map(key => {
        let val = obj[key];
        if (typeof val === 'string') {
            val = `"${val}"`;
        } else if (Array.isArray(val)) {
            val = `[${[val.join(',')]}]`;
        }
        return `${key}=${val}`;
    })
        .join(', ')}}`;
}

function objDefaultParameters(obj) {
    return `_obj={${Object.keys(obj).map(key => {
        let val = obj[key];

        if (typeof val === 'string') val = `"${val}"`;
        else if (Array.isArray(val)) val = `[${[val.join(',')]}]`;

        return `${key}:${val}`;
    })
        .join(', ')}}`;
}

function destructuring(obj) {
    return `{${Object.keys(obj).join(', ')}}`;
}

function defaultReturn(obj) {
    return `{
        ${Object.keys(obj)
        .map(key => {
            let val = obj[key];

            if (typeof val === 'string') val = `"${val}"`;
            else if (Array.isArray(val)) val = `[${[val.join(',')]}]`;

            return `${key}: ${val}`;
        })
        .join(',\n')}
    }`;
}

class ServiceGenerator {
    constructor({
        servicesFile,
        serverDir,
        clientDir,
        apiPath,
    }) {
        this.servicesFile = servicesFile;
        this.serverDir = serverDir;
        this.clientDir = clientDir;
        this.apiPath = apiPath;
        // Read
        this.json = utils.readJSONFile(servicesFile);
        this.types = this.json.types;
    }

    start() {
        for(const serviceName in this.json.services) {
            this.genClient(serviceName, this.json.services[serviceName]);
            this.genServer(serviceName, this.json.services[serviceName]);
        }
    }

    initializeFields(schema) {
        const obj = {};
        for(const key in schema) {
            // Assign the default
            if (schema[key].default) {
                // Check type of default with 'type'
                if (typeof schema[key].default !== schema[key].type) {
                    console.error(`assignment error: "${key}"'s default value type doesn't match "type"`);
                    continue;
                }
                obj[key] = schema[key].default;
            } else {
                // If no default, assign the zero of the type
                switch(schema[key].type) {
                // Primitive Types
                case 'string': obj[key] = ''; break;
                case 'number': obj[key] = 0; break;
                case 'boolean': obj[key] = false; break;
                case 'array': obj[key] = []; break;
                case 'object': {
                    // the "zero object" is undefined/nothing
                } break;

                default: {
                    // Custom Types
                    const customType = this.types[schema[key].type];
                    if (customType) {
                        return this.initializeFields(customType);
                    }
                    // Type not found error
                    console.error(`TypeError: "${schema[key].type}" doesn't exists`);
                }
                }
            }
        }
        return obj;
    }

    // genClient generated client code to consume the API.
    // Important Note
    // Methods starting with "get" are sent as HTTP GET requests with the parameters in the querystring of the URL.
    // Other methods are sent as HTTP POST requests with the parameters in the body.
    genClient(serviceName, json) {

        const imports = `
            function getJSONAsURLEncoded(json) {
                const params = new URLSearchParams()
                for (const [key, value] of Object.entries(json)) {
                    params.append(key, value);
                }
                return "?" + params.toString();
            }`;

        const ops = json.ops;
        const methods = [];
        for (const opName in ops) {
            const req = this.initializeFields(ops[opName].req);
            const res = {
                ok:   this.initializeFields(ops[opName].res.ok),
                fail: this.initializeFields(ops[opName].res.fail),
            };
            const isGet = opName.startsWith('get');
            methods.push(`${opName}(${objDefaultParameters(req)}) {
                    for(const key in _obj) {
                        if (!_obj[key]) {
                            delete _obj.key;
                        }
                    }
                    const queryString = getJSONAsURLEncoded(_obj);
                    return fetch("${this.apiPath}/${serviceName}/${opName}" ${isGet ? '+ queryString' : ''}, {
                        method: "GET",
                        credentials: "same-origin",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        ${!isGet ? `body: JSON.stringify(${destructuring(req)})` : ''}
                    })
                    .then(response => {
                        if (response.ok) {
                            return response.json();
                        } else {
                            console.error("${serviceName}Service.${opName} error:", response.statusText());
                        }
                    })
                    .then(json => {
                        const ${destructuring(res.ok)} = json;
                        return (${destructuring(res.ok)});
                    })
                    .catch(err => {
                        console.error("${serviceName}Service.${opName} error:", err);
                    });
                }`);
        }

        const code = `
            // Auto-generated "${serviceName}Service.js"
            // PLEASE DO NOT CHANGE
            ${imports}
            const ${serviceName}Service = {
                ${methods.join(',\n\n')}
            }
            export default ${serviceName}Service;
            `;

        fs.writeFileSync(path.join(__dirname, `/client/api/${serviceName}Service.js`), code);
    }

    // genServer generates the server code to provide the service
    genServer(serviceName, json) {

        const imports = `
            // Models
            const User = require('./models/user');
            // Routes
            const router = require('express').Router();
            module.exports.router = router;
            `;

        const ops = json.ops;
        const methodsAndRoutes = [];
        for (const opName in ops) {
            const req = this.initializeFields(ops[opName].req);
            const res = {
                ok:   this.initializeFields(ops[opName].res.ok),
                fail: this.initializeFields(ops[opName].res.fail),
            };
            const verb = opName.startsWith('get') ? 'get' : 'post';
            const methodName = `${opName}`;
            methodsAndRoutes.push(`
                async function ${methodName}(${objDefaultParameters(req)}) {
                    throw '"${methodName}" is not implemented';
                    // @TODO: Success
                    return (${defaultReturn(res.ok)});
                    // @TODO: Fail
                    return (${defaultReturn(res.fail)});
                }
                router.${verb}('${this.apiPath}/${serviceName}/${opName}', async (req, res, next) => {
                    const ${destructuring(req)} = req.body;
                    const jsonResponse = await ${methodName}(${destructuring(req)});
                    res.status(200).json(jsonResponse);
                });
                module.exports.${methodName} = ${methodName};
                `);
        }

        const code = `
            ${imports}
            ${methodsAndRoutes.join('\n\n')}
            `;

        fs.writeFileSync(path.join(__dirname, `/server/api/${serviceName}Service.js`), code);
    }

}

module.exports = ServiceGenerator;
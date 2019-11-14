# cgapis: Code Generation from API Specification
`cgapis` generates client-side SDKs and server-side APIs from specification files.

## Installation and Usage
```bash
npm install -g cgapis # install globally to use from any directory
```

Start by copying the two directories `/api-schemas` and `/api-services`, then run:
```bash
cgapis
```

This will generate two output directories `/generated-server` and `/generated-client`.

Note: configuration files and CLI arguments are not yet implemented.

# Why Code Generation?
## 1. Design-first Approach to API Development Life-cylce
- A contract between frontend and backend developers. A single source of truth for the API
- Language independent (see: [Supported Languages](#supported-languages))

## 2. Client Development Experience (DX)
- Discoverable API through the SDK
  - Static typing
  - Auto completion
  - API documentation

## 3. Robust Error-Handling
- Full power of error handling in your language
- Application-specific errors (no generic status codes)

## 4. Data Validation (Optional)
- Before requests leave the client and when requests reach the server
- Using powerful [JSON Schema](http://json-schema.org/) validators (e.g., [Ajv](https://github.com/epoberezkin/ajv) in case of JavaScript)

## 5. Cacheable By Default
Unlike GraphQL and JSON-RPC, cgapis is cacheable by default.

## 6. HTTP Methods Are Limiting
HTTP verbs aren't enough to express all functionalities of the web service, if your logic isn't just about GET, POST, PUT, PATCH, DELETE. For example, let's say I have a `Course` Collection/Table, which contains a curriculum, which is an array of `Sections` and within each section is an array of `Nodes` which contain the content of the course, i.e., the learning material.

Now, how would you map the following to HTTP verbs?:
1. Reorganize sections or nodes
2. Increment views on a node
3. Increment/Decrement likes/dislikes on a course
4. Add a comment to a node

Developers' views would vary, simply because there are many ways to do it:
- What path to use?
- Should we make action paths?
- Pass parameters through URL path?
- Pass parameters through URL query?
- Pass parameters through request body?

I would like to just call `SDK.Course.dislike(courseID, userID)`, or `SDK.Node.addComment(nodeID, comment)`. What do you think?

Low-level primitives such as URL endpoints, HTTP methods, request body, query strings, URL encoding, content-type, ...etc are inferred by our smarter generators and abstracted away from the user (still available if needed).

# Workflow

## 1. Initial Definition
Developers agree to define:
- Services in `/api-services` a namespace for operations
- Schemas in `/api-schemas` defined using [JSON Schema draft-07](http://json-schema.org/)
- Service operations defines the structure of the request (`req`) and response (`res`)

## 2. Code Generation
Then, you `cd` into the directory where `/api-services` and `/api-schemas` exist, and run the command `cgapis`. You'll see the output as two directories: `/generated-client` and `/generated-server`.

## 3. Later Modification of Specifications
We would like to provide a way to detect changes in specification changes. (not implemented yet)

# Solution Details
We're using RPC over HTTP: basically, a remote procedure URL is as follows: `http://<hostname>/api/<service>/<method>`. Using only two HTTP methods to do CRUD: `GET` for "Read" operations and `POST` for "Create", "Update", "Delete" operations. The generated code uses whatever network library there is to pass/recieve requests/responses between the client and the server, exposing a unified interface to application code both on the server (named: API) and the client (named: SDK). The interface contains methods on services and data types.

## TBD (To Be Done)
- Handling Errors
- Access Control
- Deal with change in spec
- Over-fetching workaround

# Supported Languages
|                    | Language/Frameworks |
|--------------------|------------|
| Client SDKs        | **Browser** ([Axios](./generators/javascript/client/axios-ts.js)) |
| Server APIs        | **Node** ([Express.js](./generators/javascript/server/express-ts.js)) |

# Contribution
Generators for each language is at `/generators/<lang>/[client|server]/<framework>.js`.

|File / Directory                    |Description                                                                                    |
|---------------------|--------------------------------------------------------------------------------------------------------------|
|`index.js`             |Main entry                                                                                                    |
|`config.js`            |Configuration                                                                                                 |
|`cmd.js`               |Command-Line Interface (overwrites config)                                                                    |
|`spec.js`              |Exports `{schemas, services}` after reading, parsing, and normalizing `/api-schemas` and `/api-services`                    |               |
|`/generators/semantics.js`|Helper functions for all languages                                            |
|`/generators/<lang>/common/`  |Help functions for `<lang>` shared across frameworks                           |

### Some of the few things you can help with:
- Add languages/frameworks: Go, Python, Rust, ...etc.
- [Suggest ways to improve](https://github.com/HassanAlgoz/cgapis/issues)
- [Use, and raise issues](https://github.com/HassanAlgoz/cgapis/issues)
Todos:
- [x] asdf

### Remember
- The solution shall not make anything harder to do (e.g., access control, error-handling, logging, or validation). Only easier and simpler
- The solution shall adapt to changes in API specs
- The solution shall be easily customized to users' needs
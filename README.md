# cgapis: Code Generation From API Specification
Code generated for both client- and server-side.

## Install
```bash
npm install -g cgapis # install globally to use from any directory
```

## Workflow
Developers agree to define:
- Services in `/api-services` a namespace for operations
- Schemas in `/api-schemas` defined using [JSON Schema draft-07](http://json-schema.org/)
- Service operations defines the structure of the request (`req`) and response (`res`)

## Advantages
1. Developer Friendly
    - auto completion
    - better static error catching
    - everything is documented (and supported by the IDE)
    - everybody agrees = less arguments during work = more work done
    - detect API design changes
2. Auto data validation
    - runtime error catching and handling
    - validate on the client-side before requesting

## Solution Promises
- The solution shall not make anything harder to do (e.g., access control, error-handling, logging, or validation). Only easier and simpler
- The solution shall adapt to changes in API specs
- The solution shall be easily customized to the users' needs. (client language, server language, frameworks, ..etc)

[Contribution Guides]()

## Usage
Start by copying the two directories `api-schemas` and `api-services`, then run:
```bash
cgapis
```

## Other Options
```
Usage: cgapis [options] [command]

Generates client-side & server-side code from API specification files

Options:
  -V, --version                       output the version number
  -p, --schemas-dir <path>            Directory of API Schemas
  -P, --services-dir <path>           Directory of API Services
  -a, --api-version <version>         API Version
  -S, --server-dir <path>             Directory for the generated server-side code
  -C, --client-dir <path>             Directory for the generated client-side code
  -c, --client-lang <lang-framework>  client language and framework
  -s, --server-lang <lang-framework>  server language and framework
  -h, --help                          output usage information
```

## Solution Details
- Let the user deal with the API directly, calling methods, and getting return values
- Abstracting away the low-level primitives such as URL endpoints, HTTP methods, request body, query strings, URL encoding, ...etc
- The user will still have low-level control

![Figure1](./img/figure1.png)

- A request to the server is like passing parameters to a function
- A response from the server is like the return value from the function

## Problems Addressed
### 1. Client & Server Mistmatch
REST over HTTP doesn't gaurantee API synchronization between the server and the clients. Changes made to the API on the server have to be reflected at each client. This is done manually, which wastes time, and is boring. We can automate that. Also, the API has to be clearly defined and agreed upon by both client-side and server-side developers. This eliminates any conflicts that would otherwise arise later on.

### 2. REST is Not Enough
RESTful isn't an agreed upon standard. Everybody has his own "standard", opinions, and "best practices". HTTP verbs aren't enough to express all functionalities of the web service, if your logic isn't just about GET, POST, PUT, PATCH, DELETE. For example, let's say I have a `Course` Collection/Table, which contains a curriculum, which is an array of `Sections` and within each section is an array of `Nodes` which contain the content of the course, i.e., the learning material.

Now, how would you map the following to HTTP verbs?:
1. Reorganize sections or nodes
2. Increment views on a node
3. Increment/Decrement likes/dislikes on a course
4. Add a comment to a node

Developers views on this would vary, simply because there are many ways to do this. My point is, don't bother. Besides, wouldn't it be more practical to deal with methods on objects directly?.

### 3. HTTP Status Codes Aren't Expressive
HTTP status codes are predefined generic messages. Trying to communicate through status codes is a futile endavor. Instead, we can define application specific status codes (error codes, specifically) that make sense to the client, and are discoverable through auto-completion. Afterall, robust systems are designed to handle errors well. That means clients know what errors servers might return, and handle each error accordingly, leaving no errors unhandled!.

### 4. Boilerplate Code
Alot of code on the client side to make requests to specific URLs are just repetetive and prone to error, because there is no automatic checker that tells us whether we made a mistake in the URL, or how the parameter names are not right, or any other detials. We can solve this problem. And we can let the computer write this low-level code for you.

## (Extra) Validation
It is redundant to do validation both client- and servers-side. We can solve this problem by defining our data types once, and have the program generate all the runtime validation code required. The `ajv` (Another JSON Schema Validator) library would be used for validating schemas. The library implements the JSON-Schema standard, which makes it interoperable with other libraries as well. Custom validation code is a concern that we'll try to address as well.
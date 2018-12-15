# Project Problem Statement

## REST is Not Enough
REST doesn't provide enough expressiveness. **HTTP verbs are not enough to express all functionalities of the web service.** Moreover, you would run into all sorts of debates about how to do REST &quot;the right way&quot;, and the hierarchy of your resources. Besides, dealing with URLs is not as good as dealing with functions/methods directly.

## Productivity Loss
Writing the APIs always involve writing **boilerplate code at both the client- and server side**. Moreover, if you change something, you have to update the other. Manually. This makes changes slow and would eventually introduce errors. More time to waste fixing those errors. The bigger the application, the harder it gets.

## Runtime Validation
Why not have type-safe APIs? The problem with type-less APIs is the inconsistency and the unpredictability of the API, either client-side or server-side. **Validations at runtime also have to be done on both sides**. We can solve this problem by defining our data types once, and have the program generate all the runtime validation code required.

# Solution: Abstraction
We, as software engineers are not bound to think of low-level primitives such as URLs, endpoints, GET, POST, PUT, PATCH, and DELETE, request headers, request body, and query string parameters, ...etc. We can make an abstraction that **makes web services's methods feel like local methods**. Consider this:

- A request to the server is like passing parameters to a function
- A response from the server is like the return value from the function

So, our abstraction sits on top of concrete functions such as the `fetch` API for the browser, and the HTTP Web Server, on Node.js. So, my solution is to develop a software that takes care of this difference between the two. We only need to provide the same file that describes the following:

- **services**: like namespaces. For organizing operations together
- **operations**: which are the method/function names
- **request**: describes function parameters
- **response**: describes function return values. Contains two cases **OK** and **Fail**
- **types**: defines user-defined data types

Data is defined with types, so that proper types are provided when the code is generated, and for the generated validation code.

**Note**: The project is still in early stages.

You are more than welcome to contribute.

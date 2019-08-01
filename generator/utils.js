/**
 * utils.js provides helper functions used across all types of generators (not specific to any language)
 */
module.exports = {
    isGet: (methodName) => ["get", "find", "list", "fetch", "search"].some(s => methodName.startsWith(s)),
};
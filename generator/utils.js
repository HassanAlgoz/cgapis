module.exports = {
    isGet: (methodName) => ["get", "find", "list", "fetch", "search"].some(s => methodName.startsWith(s)),
};
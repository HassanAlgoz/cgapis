export default interface LanguageGenerator {
    client: {
        generateRequestMethod(serviceName :string, methodName :string, req :object, res :object) :string
        groupServiceOperations(services :object[]) :string
    }

    server: {
        makeRoute(serviceName :string, methodName :string, url :string, req :object, res :object) :string
        APIMethod (serviceName :string, methodName :string, req :object, res :object) :string
        groupServiceRoutes(services: object[]) :string
    }
}
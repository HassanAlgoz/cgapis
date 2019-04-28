export default interface Parser {
    parse(str: string) : SpecSchema
}

export type SpecSchema = {
    services :object
    refs :object
}
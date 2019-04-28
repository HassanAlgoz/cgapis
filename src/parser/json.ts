import Parser from './interface'
import {SpecSchema} from './interface'

let json :Parser = {
    parse(str: string): SpecSchema {
        return JSON.parse(str);
    }
}
export default json;
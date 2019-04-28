import * as prettier from "prettier"

import Formatter from './interface'

const formatter :Formatter = {
    format(src: string): string {
        return prettier.format(src, {
            parser:        "typescript",
            tabWidth:      4,
            trailingComma: "all",
            semi:          true,
        });
    }
}
export default formatter;
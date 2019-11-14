const OFF = 0, WARN = 1, ERROR = 2;

module.exports = {
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018, // (same as 9)
        "sourceType": "module",
        "ecmaFeatures": {
            "impliedStrict": true,
        }
    },
    "rules": {
        "no-console": OFF,

        // Possible Errors
        "eqeqeq": [ERROR, "always"],
        "semi": [WARN, "always"],
        "no-param-reassign": OFF,
        "no-template-curly-in-string": ERROR,
        "no-await-in-loop": WARN,
        "no-async-promise-executor": ERROR,
        "no-return-assign": [ERROR, "always"],
        "handle-callback-err": ["error", "^(err|error)$"], // either named err orERROR
        // Variables' Declaration & Initialization
        "no-unused-vars": [WARN, {
            "args": "none", // disable on function arguments.
            "caughtErrors": "all", // catch (err)
        }],
        "init-declarations": [ERROR, "always"],
        "no-var": ERROR,
        "no-undef-init": ERROR,
        "no-undefined": ERROR,
        "no-use-before-define": [ERROR, {
            "functions": false,
            "variables": true,
            "classes": true
        }],
        "no-shadow": [ERROR, {
            "builtinGlobals": true,
            "hoist": "all",
            "allow": ['status', 'name']
        }],
        "no-extra-parens": WARN,

        // Stylistic
        "brace-style": [WARN, "1tbs"],
        "indent": [ERROR, 4],
        "quotes": [WARN, "double"],
        "no-ternary": OFF,
        "no-trailing-spaces": WARN,
        "key-spacing": [WARN, {
            "mode": "minimum",
            "align": "value", // "value" | "colon"
        }],
        "space-unary-ops": [2, {
            "words": true,
            "nonwords": false,
        }],
        // "no-multi-spaces": [ERROR, { ignoreEOLComments: true }],
        // "sort-imports": [ERROR, {
        //     "ignoreCase": false,
        //     "ignoreMemberSort": false,
        //     "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
        // }],
        "comma-dangle": [WARN, "always-multiline"],
        "comma-style": [ERROR, "last"],
        "no-multiple-empty-lines": [WARN, {
            "max": 2,
            "maxBOF": 1,
            "maxEOF": 2,
        }],
        "implicit-arrow-linebreak": [WARN, "beside"],
        "newline-per-chained-call": OFF,
        "yoda": [ERROR, "never", {
            exceptRange: true
        }],

        // "no-multi-str": WARN,
        // "default-case": WARN,
        // "curly": WARN,
        // "prefer-const": ERROR,

    }
};
module.exports = {
    // You can configure a .eslintrc file and download it at: https://eslint.org/demo/
    // Just open the "Rules Configurations" below, and check the boxes.
    // Then scroll all the way down to find the download action
    "env": {
        "es6": true,
        "node": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2018, // (same as 9)
        "sourceType": "script",
        "ecmaFeatures": {
            "impliedStrict": true,
        }
    },
    "overrides": [{ // Browser Environment
        "files": ["client/**/*.js"],
        "env": {
            "browser": true,
            "jquery": true,
        },
        "parserOptions": {
            "sourceType": "module",
        },
        "rules": {
            "no-console": "warn",
            "no-ternary": "off",
        },
        "globals": {
            "Vue": false, // false means not overwritable
        }
    }],
    "rules": {
        "no-console": "off",

        // Possible Errors
        "eqeqeq": ["error", "always"],
        "semi": ["warn", "always"],
        "no-param-reassign": "error",
        "no-template-curly-in-string": "error",
        "no-await-in-loop": "warn",
        "no-async-promise-executor": "error",
        "no-return-assign": ["error", "always"],
        "handle-callback-err": ["error", "^(err|error)$"], // either named err or error.
        // Variables' Declaration & Initialization
        "no-unused-vars": ["warn", {
            "args": "none", // disable on function arguments.
            "caughtErrors": "all", // catch (err)
        }],
        "init-declarations": ["error", "always"],
        "no-var": "error",
        "no-undef-init": "error",
        "no-undefined": "error",
        "no-use-before-define": ["error", {
            "functions": false,
            "variables": true,
            "classes": true
        }],
        "no-shadow": ["error", {
            "builtinGlobals": true,
            "hoist": "all",
            "allow": []
        }],
        "no-extra-parens": "warn",

        // Stylistic
        "brace-style": ["warn", "1tbs"],
        "indent": ["error", 4],
        "quotes": ["warn", "double"],
        "no-ternary": "off",
        "no-trailing-spaces": "warn",
        "key-spacing": ["warn", {
            "mode": "minimum",
            "align": "value", // "value" | "colon"
        }],
        "space-unary-ops": [2, {
            "words": true,
            "nonwords": false,
        }],
        // "no-multi-spaces": ["error", { ignoreEOLComments: true }],
        "sort-imports": ["error", {
            "ignoreCase": false,
            "ignoreMemberSort": false,
            "memberSyntaxSortOrder": ["none", "all", "multiple", "single"]
        }],
        "comma-dangle": ["warn", "always-multiline"],
        "comma-style": ["error", "last"],
        "no-multiple-empty-lines": ["warn", {
            "max": 2,
            "maxBOF": 1,
            "maxEOF": 2,
        }],
        "implicit-arrow-linebreak": ["warn", "beside"],
        "newline-per-chained-call": ["none"],
        "yoda": ["error", "never", {
            exceptRange: true
        }],

        // "no-multi-str": "warn",
        // "default-case": "warn",
        // "curly": "warn",
        // "prefer-const": "error",

    }
};
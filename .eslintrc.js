module.exports = {
    root: true,
    env: {
        node: true
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        sourceType: "module"
    },
    plugins: [
        "@typescript-eslint",
    ],
    rules: {
        "linebreak-style": ["error", "unix"],
        "camelcase": ["error", {
            properties: "never"
        }],
        "semi": ["error", "never"],
        "quotes": ["error", "double"],
        "indent": ["error", 4, {
            SwitchCase: 1
        }],
        "space-before-function-paren": ["error", {
            anonymous: "always",
            named: "never",
            asyncArrow: "always"
        }],
        "space-before-blocks": ["error", "always"],
        "arrow-spacing": ["error", {
            before: true,
            after: true
        }],
        "switch-colon-spacing": ["error", {
            before: false,
            after: true
        }],
        "keyword-spacing": ["error", {
            before: true,
            after: true
        }],

        "brace-style": ["error", "1tbs"],
        "object-curly-spacing": ["error", "always"],
        "arrow-parens": ["error", "as-needed"],
        "no-unsafe-optional-chaining": "error",
        "prefer-arrow-callback": "error",
        "func-style": ["error", "declaration"],
        "newline-per-chained-call": ["error", {
            ignoreChainWithDepth: 2
        }],

        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/array-type": ["error", {
            default: "array"
        }],
        "@typescript-eslint/ban-types": ["error"],
        "@typescript-eslint/member-delimiter-style": ["error", {
            multiline: {
                delimiter: "none",
                requireLast: false
            },
            singleline: {
                delimiter: "comma",
                requireLast: false
            },
        }],
        "@typescript-eslint/method-signature-style": ["error", "property"]
    }
}

module.exports = {
    env: {
        node: true,
        browser: true
    },
    globals: {
        //Utils window
        scrolling: "readonly",

        // Utils Lang
        clone: "readonly",
        equals: "readonly",
        isEmpty: "readonly",
        isBoolean: "readonly",
        isString: "readonly",
        isNumber: "readonly",
        isCallable: "readonly",
        isDefined: "readonly",
        dateFormat: "readonly",

        // Utils Arrays
        diff: "readonly",
        pushIfAbsent: "readonly",
        prependIfAbsent: "readonly",
        removeIfPresent: "readonly",
        replaceIfPresent: "readonly",
        moveInFirstPosition: "readonly",
        prepend: "readonly",
        lastOf: "readonly",
        flatten: "readonly",
        visitUntil: "readonly",

        //Utils Filesystem
        ReaderStreamImage: "readonly",
        ReaderStreamVideo: "readonly",

        //Utils String Validator
        EmailValidator: "readonly",
        PasswordValidator: "readonly"
    },
    plugins: ["@typescript-eslint/eslint-plugin", "vue"],
    extends: ["plugin:vue/recommended"],
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module"
    },
    rules: {
        "@typescript-eslint/no-var-requires": "off",

        "vue/multi-word-component-names": ["error", {
            "ignores": [
                "Like", "Logo", "Chat", "Comments", "Comment", "Avatar",
                "Loading",
                "Searches", "Login"
            ]
        }],
        "vue/block-tag-newline": ["error", {
            singleline: "always",
            multiline: "always",
            maxEmptyLines: 1
        }],

        "vue/require-default-prop": "error",
        "vue/require-prop-types": "error",

        "vue/attributes-order": "error",
        "vue/this-in-template": ["error", "never"],
        "vue/valid-v-for": "error",
        "vue/use-v-on-exact": "error",

        "vue/no-spaces-around-equal-signs-in-attribute": "error",
        "vue/no-multi-spaces": ["error", {
            ignoreProperties: false
        }],
        "vue/v-slot-style": ["error", {
            atComponent: "shorthand",
            default: "shorthand",
            named: "shorthand",
        }],
        "vue/html-end-tags": "error",
        "vue/mustache-interpolation-spacing": "error",
        "vue/multiline-html-element-content-newline": "error",
        "vue/singleline-html-element-content-newline": "error",
        "vue/no-v-html": "error",
        "vue/no-potential-component-option-typo": "error"
    },
}

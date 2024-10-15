const pluginImport = require("eslint-plugin-import");
const prettierConfig = require("eslint-config-prettier");

module.exports = [
  {
    plugins: {
      import: pluginImport,
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      globals: {
        window: "readonly",
        document: "readonly",
        console: "readonly",
        module: "readonly",
        require: "readonly",
        process: "readonly",
        // Add other globals as needed
      },
    },
    rules: {
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "res|next|^err",
        },
      ],
      "arrow-body-style": ["error", "as-needed"],
      "no-param-reassign": [
        "error",
        {
          props: false,
        },
      ],
      "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
      //'no-console': 'warn',
      quotes: [
        "error",
        "double",
        {
          allowTemplateLiterals: true,
        },
      ],
      "func-names": "off",
      "space-unary-ops": "error",
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "comma-dangle": "off",
      "max-len": "off",
      "import/extensions": "off",
      "import/namespace": "off",
      "no-underscore-dangle": "off",
      "consistent-return": "off",
      radix: "off",
      "no-shadow": [
        "error",
        {
          hoist: "all",
          allow: ["resolve", "reject", "done", "next", "err", "error"],
        },
      ],
      "no-unused-expressions": "off",
    },
  },
  prettierConfig, // Adding Prettier rules manually as an object
];

// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    rules: {
      // Formatação é aviso, não erro: nunca bloqueia o trabalho, e `npm run lint:fix` resolve.
      'prettier/prettier': 'warn',
    },
  },
]);

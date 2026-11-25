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
  {
    // Cores só nos tokens (src/tema): sem isso, os valores fixos voltam e o tema claro vira reescrita.
    // As ilustrações (ícones e personagem) têm paleta própria e ficam de fora.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/tema/**', 'src/icones/**', 'src/componentes/Personagem.tsx', '**/__tests__/**'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/^(#[0-9a-fA-F]{3,8}|rgba?[(])/]',
          message: 'Use uma cor de src/tema/tokens.ts (cor ou brilho), e não um valor fixo.',
        },
      ],
    },
  },
]);

import { defineConfig, globalIgnores } from 'eslint/config';
import ts from 'eslint-config-cheminfo-typescript';

export default defineConfig(globalIgnores(['coverage', 'lib']), ts, {
  rules: {
    'no-console': 'off',
    'no-await-in-loop': 'off',
  },
});

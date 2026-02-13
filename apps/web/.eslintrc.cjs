/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  extends: ['@repo/eslint-config/index.js'],
  parserOptions: {
    project: true,
  },
  rules: {
    // Warn about potential incorrect imports from local ui components
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: ['@/components/ui/*'],
            message: "Import UI components from '@repo/ui' instead of '@/components/ui'",
          },
        ],
      },
    ],
  },
}

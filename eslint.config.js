import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
    ignores: [
      'assets/**/*',
    ],
  },
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
)

import antfu from '@antfu/eslint-config'

export default antfu(
  {
    unocss: true,
    formatters: true,
    ignores: [
      'public/**/*',
    ],
  },
  {
    rules: {
      curly: ['error', 'all'],
    },
  },
)

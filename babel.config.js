module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { ie: 11, uglify: true },
        useBuiltIns: "usage"
      }
    ],
    ['@vue/app', {
      polyfills: [
        'es.promise',
        'es.symbol'
      ]
    }]
  ],
  plugins: [
    "@babel/transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-optional-chaining"
  ]
};

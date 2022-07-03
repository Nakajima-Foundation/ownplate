module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: { ie: 11, uglify: true },
        useBuiltIns: "usage"
      }
    ]
  ],
  plugins: [
    "@babel/transform-runtime",
    "@babel/plugin-syntax-dynamic-import",
    "@babel/plugin-proposal-optional-chaining"
  ]
};

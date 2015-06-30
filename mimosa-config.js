exports.config = {
  modules: ['jshint', 'copy'],
  watch: {
    sourceDir: "src",
    compiledDir: "ignore",
    javascriptDir: null
  },
  jshint: {
    rules: {
      node: true,
      laxcomma: true
    }
  }
};
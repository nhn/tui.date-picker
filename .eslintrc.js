module.exports = {
  extends: 'tui',
  parserOptions: {
    ecmaVersion: 3
  },
  env: {
    browser: true,
    jasmine: true,
    commonjs: true
  },
  globals: {
    tui: true,
    loadFixtures: true
  }
};

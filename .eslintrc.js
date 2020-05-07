module.exports = {
  extends: ['tui', 'plugin:prettier/recommended'],
  plugins: ['prettier'],
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

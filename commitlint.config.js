module.exports = {
    extends: ['@commitlint/config-conventional'],
    parserPreset: {
        parserOpts: {
            headerPattern: /^([^0-9]\w*)(?:\(([^0-9].*)\))?!?: (.*)$/,
        }
    },
    rules: {
        'body-max-line-length': [2, 'always', 120],
        'footer-max-line-length': [2, 'always', 120],
        'header-max-length': [2, 'always', 72],
    },
};

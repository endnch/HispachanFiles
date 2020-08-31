'use strict';

module.exports = {
    'env': {
        'browser': true,
        'commonjs': true,
        'es6': true,
        'node': true,
    },
    'extends': 'eslint:recommended',
    'parserOptions': {
        'ecmaVersion': 2018,
    },
    'rules': {
        'indent': [
            'error',
            4,
        ],
        'quotes': [
            'error',
            'single',
        ],
        'semi': [
            'error',
            'always',
            { 'omitLastInOneLineBlock': true },
        ],
        'comma-dangle': [
            'error',
            'always-multiline',
        ],
        'no-trailing-spaces': [
            'error',
        ],
        'block-spacing': [
            'error',
            'always',
        ],
        'object-curly-spacing': [
            'error',
            'always',
        ],
        'strict': [
            'error',
            'safe',
        ],
        'eqeqeq': [
            'error',
            'always',
        ],
        'no-var': [
            'error',
        ],
        'prefer-arrow-callback': [
            'error',
        ],
        'brace-style': [
            'error',
            '1tbs',
            { 'allowSingleLine': true },
        ],
        'keyword-spacing': [
            'error',
            { 'before': true, 'after': true },
        ],
        'arrow-spacing': [
            'error',
            { 'before': true, 'after': true },
        ],
        'space-infix-ops': [
            'error',
        ],
        'prefer-const': [
            'error',
        ],
        'comma-spacing': [
            'error',
            { 'before': false, 'after': true },
        ],
    },
    'overrides': [
        {
            'files': ['client/**/*.js'],
            'parserOptions': { 'sourceType': 'module' },
        },
    ],
};

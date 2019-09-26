const { rules } = require('../../index.js');
const { RuleTester } = require('eslint');

const ruleTester = new RuleTester({
    parserOptions: {
        ecmaVersion: 2016,
    },
});

ruleTester.run('lodash-to-native/map', rules.map, {
    valid: [
        'const x = 5;',
        'for (let i = 0; i < x; i++) console.log(i)',
        'console.log("test")',
        '_.map({})',
        '_.map({x: 15, a: "string"})'
    ],

    invalid: [
        {
            code: '_.map([])',

            errors: [
                {
                    message: 'Use native Array.map method instead of lodash version',
                    type: 'CallExpression',
                },
            ]
        }, {
            code: 'const x = [1,2]; _.map(x);',

            errors: [
                {
                    message: 'Use native Array.map method instead of lodash version',
                    type: 'CallExpression',
                },
            ]
        }
    ],
});
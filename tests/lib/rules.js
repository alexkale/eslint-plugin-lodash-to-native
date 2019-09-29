const { RuleTester } = require('eslint');
const { rules } = require('../../index.js');

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 2016,
  },
});

ruleTester.run('lodash-to-native/map', rules.map, {
  valid: [
    '_.map({a: "b", c: 15}, cb);',
    'var a = Array.isArray(val) ? val.map( cb) : _.map(val, cb);',
    'console.log(42)',
  ],

  invalid: [
    {
      code: 'var a = _.map([1,2,3], cb)',
      errors: [{ message: 'Use native Array.map implementation instead of lodash version' }],
      output: 'var a = [1,2,3].map(cb)',
    },
    {
      code: 'var a = _.map([{a: 12}, {b: 15}], cb)',
      errors: [{ message: 'Use native Array.map implementation instead of lodash version' }],
      output: 'var a = [{a: 12}, {b: 15}].map(cb)',
    },
    {
      code: 'var a = _.map(obj, cb)',
      errors: [{ message: 'Use native Array.map implementation instead of lodash version if argument is array' }],
      output: `var a = Array.isArray(obj) ?
          obj.map(cb) :
          _.map(obj, cb)`,
    },
    {
      code: 'var a = _.map(getItems(), v => v.toString())',
      errors: [{ message: 'Use native Array.map implementation instead of lodash version if argument is array' }],
      output: `var a = (val => Array.isArray(val) ?
          val.map(v => v.toString()) :
          _.map(val, v => v.toString()))(getItems())`,
    },
  ],
});

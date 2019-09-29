/**
* const x = _.map(var, cb);
* План:
* Оставить bare-bones имплементацию, которая:
*     1. Смотрит не выше одного уровня сверху и проверяет наличие Array.isArray
*     2. Проверяет сам аргумент, если это – ArrayLiteral,
*         сразу меняет на нативный вариант Array.map
*     3. Если аргумент – ObjectLiteral, ничего не меняет
*     4. Если аргумент – вызов функции, кэшируем (iife / временная переменная)
*        const x = _.map(getCollection,cb) =>
*        const x = (Array.isArray(val) ?
*                   return val.map(cb) :
*                   return _.map(val,cb))(getCollection())
*     5. Если _ был переопределен (тут юзать BlockStatement/:exit):
*         проверить на require/import, если это lodash – правило применяем, иначе – нет
*     6. Не забыть проверить отступы
* После, доработать (как минимум начать):
*     1. Следить за всеми проверками на массив,
*         т.к. в целом вызов map может быть вложен в несколько if'ов
*         и какой-то из них может быть проверкой Array.isArray
*         (как вариант – map(varName => stack), делать push/pop в if'ах)
*/

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
  },
  create: (context) => {
    const INDENT_SIZE = 2;

    const sourceCode = context.getSourceCode();

    /**
     * Checks if node is of a given type
     * @param {ASTnode} node
     * @param {String} type
     */
    const isType = (node, type) => node.type === type;
    const isCall = (node) => isType(node, 'CallExpression');
    const isIdentifier = (node) => isType(node, 'Identifier');
    const isMemberExpression = (node) => isType(node, 'MemberExpression');
    const isArrayExpression = (node) => isType(node, 'ArrayExpression');
    const isArrayFrom = (node) => {
      return (isCall(node)
      && isMemberExpression(node.callee)
      && node.callee.object.name === 'Array'
      && node.callee.property.name === 'from');
    };
    // Might want to add check for map function as argument


    /**
    * Returns true if node is wrapped in collection type check
    * @param {ASTnode} node
    */
    const isWrappedInConditional = (node) => {
      return (node.parent.type === 'ConditionalExpression'
      && node.parent.test.callee.property.name === 'isArray'
      && node.parent.test.arguments[0].name === node.arguments[0].name);
    };

    /**
     * Returns source code for this rule's fix with conditional wrapping
     * @param {ASTnode} node – MemberExpression this rule is executed on
     * @param {Boolean} iife – whether to wrap resulting call in IIFE
     */
    const getReplacementText = (callee, iife = false) => {
      const collectionSrc = sourceCode.getText(callee.arguments[0]);
      const cbSrc = sourceCode.getText(callee.arguments[1]);

      const collection = iife ? 'val' : collectionSrc;

      const ifCondition = `Array.isArray(${collection})`;
      const lodashCall = `_.map(${collection}, ${cbSrc})`;
      const nativeCall = `${collection}.map(${cbSrc})`;
      const newLineIndent = ' '.repeat(callee.loc.start.column + INDENT_SIZE);

      const expr = `${ifCondition} ?\n${newLineIndent}${nativeCall} :\n${newLineIndent}${lodashCall}`;

      if (iife) return `(val => ${expr})(${collectionSrc})`;
      return expr;
    };

    return {
      BlockStatement(node) {
        
      },

      // eslint-disable-next-line func-names
      "CallExpression[callee.type='MemberExpression'][callee.object.name='_'][callee.property.name='map'][arguments]": function (node) {
        if (node.arguments.length !== 2) return;

        const collection = node.arguments[0];

        if (isIdentifier(collection)) {
          if (!isWrappedInConditional(node)) {
            context.report({
              node,
              message: 'Use native Array.map implementation instead of lodash version if argument is array',
              fix(fixer) {
                return fixer.replaceText(node, getReplacementText(node));
              },
            });
          }
        } else if (isArrayExpression(collection) || isArrayFrom(collection)) {
          context.report({
            node,
            message: 'Use native Array.map implementation instead of lodash version',
            fix(fixer) {
              const firstArgRange = [collection.start, node.arguments[1].start];
              return [
                fixer.replaceText(node.callee.object, sourceCode.getText(collection)),
                fixer.removeRange(firstArgRange),
              ];
            },
          });
        } else if (isCall(collection)) {
          context.report({
            node,
            message: 'Use native Array.map implementation instead of lodash version if argument is array',
            fix(fixer) {
              return fixer.replaceText(node, getReplacementText(node, true));
            },
          });
        }
      },
    };
  },
};

module.exports = {
  meta: {
    type: 'suggestion',
    fixable: 'code',
    schema: [],
  },
  create: (context) => {
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
      const newLineIndent = ' '.repeat(callee.loc.start.column);

      const expr = `${ifCondition} ?\n${newLineIndent}${nativeCall} :\n${newLineIndent}${lodashCall}`;

      if (iife) return `(val => ${expr})(${collectionSrc})`;
      return expr;
    };

    return {
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

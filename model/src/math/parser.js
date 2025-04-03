const math = require("mathjs");

class MathExpressionParser {
  constructor() {
    this.math = math.create(math.all);
  }

  parseExpression(expressionString) {
    try {
      // Check if this is an equation (contains =)
      if (expressionString.includes("=")) {
        return this.parseEquation(expressionString);
      }

      // Parse regular expression
      const node = this.math.parse(expressionString);

      const variables = this.extractVariables(node);

      return {
        parsed: true,
        expression: node,
        expressionString,
        variables,
        type: "expression",
        latex: node.toTex(),
        simplified: this.simplifyIfPossible(node),
      };
    } catch (error) {
      console.error("Error parsing expression:", error);
      return {
        parsed: false,
        expressionString,
        error: error.message,
      };
    }
  }

  // New method to handle equations specifically
  parseEquation(equationString) {
    try {
      // Split by = sign
      const sides = equationString.split("=");

      if (sides.length !== 2) {
        throw new Error("Invalid equation: should contain exactly one = sign");
      }

      const leftSide = sides[0].trim();
      const rightSide = sides[1].trim();

      // Parse both sides separately
      const leftNode = this.math.parse(leftSide);
      const rightNode = this.math.parse(rightSide);

      // Get variables from both sides
      const leftVars = this.extractVariables(leftNode);
      const rightVars = this.extractVariables(rightNode);

      // Combine unique variables
      const variables = [...new Set([...leftVars, ...rightVars])];

      return {
        parsed: true,
        expressionString: equationString,
        leftSide: {
          node: leftNode,
          expression: leftSide,
        },
        rightSide: {
          node: rightNode,
          expression: rightSide,
        },
        variables,
        type: "equation",
        latex: `${leftNode.toTex()} = ${rightNode.toTex()}`,
      };
    } catch (error) {
      console.error("Error parsing equation:", error);
      return {
        parsed: false,
        expressionString: equationString,
        error: error.message,
      };
    }
  }

  extractVariables(node) {
    const variables = new Set();

    node.traverse((node) => {
      if (node.isSymbolNode && !this.math.hasOwnProperty(node.name)) {
        variables.add(node.name);
      }
    });

    return Array.from(variables);
  }

  determineExpressionType(node) {
    // Since we're handling equations separately now, this method becomes simpler
    if (node.isFunctionAssignmentNode) {
      return "function";
    }

    if (node.isOperatorNode && node.fn === "derivative") {
      return "derivative";
    }

    if (node.isFunctionNode && node.fn.name === "integrate") {
      return "integral";
    }

    return "expression";
  }

  simplifyIfPossible(node) {
    try {
      return this.math.simplify(node).toString();
    } catch (error) {
      return node.toString();
    }
  }

  evaluateExpression(node, scope = {}) {
    try {
      return this.math.evaluate(node.toString(), scope);
    } catch (error) {
      console.error("Error evaluating expression:", error);
      return null;
    }
  }
}

module.exports = new MathExpressionParser();

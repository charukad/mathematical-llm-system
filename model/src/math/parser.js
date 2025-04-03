const math = require("mathjs");

/**
 * This class handles parsing and processing of mathematical expressions.
 * It serves as the bridge between natural language math problems and
 * structured mathematical operations.
 */
class MathExpressionParser {
  constructor() {
    // Configure mathjs with all available functions
    this.math = math.create(math.all);
  }

  /**
   * Parses a string containing a mathematical expression and extracts information
   *
   * @param {string} expressionString - The string containing the mathematical expression
   * @returns {Object} An object containing parsed expression data
   */
  parseExpression(expressionString) {
    try {
      // Parse the expression using mathjs
      const node = this.math.parse(expressionString);

      // Extract useful information from the parsed expression
      const variables = this.extractVariables(node);
      const expressionType = this.determineExpressionType(node);

      return {
        parsed: true,
        expression: node,
        expressionString,
        variables,
        type: expressionType,
        latex: node.toTex(), // Convert to LaTeX for display
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

  /**
   * Extracts variables from a parsed expression
   *
   * @param {Object} node - The parsed math expression node
   * @returns {Array} Array of variable names found in the expression
   */
  extractVariables(node) {
    const variables = new Set();

    node.traverse((node) => {
      if (node.isSymbolNode && !this.math.hasOwnProperty(node.name)) {
        variables.add(node.name);
      }
    });

    return Array.from(variables);
  }

  /**
   * Determines the type of mathematical expression
   *
   * @param {Object} node - The parsed math expression node
   * @returns {string} The type of expression (equation, function, derivative, etc.)
   */
  determineExpressionType(node) {
    // Check if it's an equation (has =)
    if (node.isRelationalNode && node.op === "=") {
      return "equation";
    }

    // Check if it's a function definition
    if (node.isFunctionAssignmentNode) {
      return "function";
    }

    // Check for common calculus operations
    if (node.isOperatorNode && node.fn === "derivative") {
      return "derivative";
    }

    if (node.isFunctionNode && node.fn.name === "integrate") {
      return "integral";
    }

    // Default to expression
    return "expression";
  }

  /**
   * Attempts to simplify the expression if possible
   *
   * @param {Object} node - The parsed math expression node
   * @returns {string} The simplified expression as a string
   */
  simplifyIfPossible(node) {
    try {
      return this.math.simplify(node).toString();
    } catch (error) {
      // If simplification fails, return the original expression
      return node.toString();
    }
  }

  /**
   * Evaluates an expression with the given variable values
   *
   * @param {Object} node - The parsed math expression node
   * @param {Object} scope - Variable values to use in evaluation
   * @returns {*} The result of the evaluation
   */
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

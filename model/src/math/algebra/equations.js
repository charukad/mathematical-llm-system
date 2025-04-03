const parser = require("../parser");
const math = require("mathjs");

/**
 * Functions for solving algebraic equations
 */
class AlgebraEquationSolver {
  /**
   * Solves a linear equation with one variable
   *
   * @param {string} equationString - The equation as a string (e.g., "2x + 3 = 7")
   * @returns {Object} Solution information
   */
  solveLinearEquation(equationString) {
    try {
      // Parse the equation
      const parsed = parser.parseExpression(equationString);

      if (!parsed.parsed) {
        return {
          solved: false,
          error: "Failed to parse equation",
          details: parsed.error,
        };
      }

      if (parsed.type !== "equation") {
        return {
          solved: false,
          error: "Input is not an equation",
          details: "Expected an equation with = sign",
        };
      }

      // Extract left and right sides of equation
      const sides = equationString.split("=");
      if (sides.length !== 2) {
        return {
          solved: false,
          error: "Invalid equation format",
          details: "Expected exactly one = sign",
        };
      }

      const leftSide = sides[0].trim();
      const rightSide = sides[1].trim();

      // Verify we have exactly one variable
      if (parsed.variables.length !== 1) {
        return {
          solved: false,
          error: "Invalid number of variables",
          details: `Expected 1 variable, found ${parsed.variables.length}`,
        };
      }

      const variable = parsed.variables[0];

      // Use mathjs to solve the equation
      const solveExpr = `solve(${leftSide} - (${rightSide}), ${variable})`;

      const solutions = math.evaluate(solveExpr);

      // Generate solution steps
      const steps = this.generateLinearSolutionSteps(
        leftSide,
        rightSide,
        variable,
        solutions
      );

      return {
        solved: true,
        equation: equationString,
        variable,
        solutions,
        steps,
        latex: {
          equation: parsed.latex,
          solution: `${variable} = ${math.parse(solutions.toString()).toTex()}`,
        },
      };
    } catch (error) {
      console.error("Error solving linear equation:", error);
      return {
        solved: false,
        error: "Failed to solve equation",
        details: error.message,
      };
    }
  }

  /**
   * Generates step-by-step solution for a linear equation
   * This is a simplified version that will be expanded in the future
   */
  generateLinearSolutionSteps(leftSide, rightSide, variable, solution) {
    return [
      {
        explanation: `Start with the original equation`,
        expression: `${leftSide} = ${rightSide}`,
      },
      {
        explanation: `Move all terms with ${variable} to the left side and all other terms to the right side`,
        expression: `...`, // This will be expanded in a future implementation
      },
      {
        explanation: `Solve for ${variable}`,
        expression: `${variable} = ${solution}`,
      },
    ];
  }
}

module.exports = new AlgebraEquationSolver();

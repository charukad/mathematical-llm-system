const parser = require("../parser");
const math = require("mathjs");

class AlgebraEquationSolver {
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

      // Extract left and right sides from the parsed equation
      const leftSide = parsed.leftSide.expression;
      const rightSide = parsed.rightSide.expression;

      // Verify we have exactly one variable
      if (parsed.variables.length !== 1) {
        return {
          solved: false,
          error: "Invalid number of variables",
          details: `Expected 1 variable, found ${parsed.variables.length}`,
        };
      }

      const variable = parsed.variables[0];

      // Move all terms to the left side
      const solveExpr = `solve(${leftSide} - (${rightSide}), ${variable})`;

      // Solve using mathjs
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

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

      // Directly solve the linear equation by moving all terms
      // This is a simple implementation for ax + b = c format equations
      try {
        // Get the coefficient of the variable and the constant term
        // For equations like ax + b = c
        const scope = {};
        scope[variable] = 1; // Set variable to 1 to find coefficient
        const withVar = math.evaluate(leftSide, scope);
        scope[variable] = 0; // Set variable to 0 to find constant
        const withoutVar = math.evaluate(leftSide, scope);

        const coefficient = withVar - withoutVar; // This gives us 'a'
        const constantLeft = withoutVar; // This gives us 'b'
        const constantRight = math.evaluate(rightSide); // This gives us 'c'

        // Solve for x: ax + b = c => x = (c - b) / a
        const solution = (constantRight - constantLeft) / coefficient;

        // Generate solution steps
        const steps = this.generateLinearSolutionSteps(
          leftSide,
          rightSide,
          variable,
          coefficient,
          constantLeft,
          constantRight,
          solution
        );

        return {
          solved: true,
          equation: equationString,
          variable,
          solutions: solution,
          steps,
          latex: {
            equation: parsed.latex,
            solution: `${variable} = ${math.format(solution, {
              precision: 14,
            })}`,
          },
        };
      } catch (error) {
        console.error("Error during direct solving:", error);
        return {
          solved: false,
          error: "Failed to solve equation directly",
          details: error.message,
        };
      }
    } catch (error) {
      console.error("Error solving linear equation:", error);
      return {
        solved: false,
        error: "Failed to solve equation",
        details: error.message,
      };
    }
  }

  generateLinearSolutionSteps(
    leftSide,
    rightSide,
    variable,
    coefficient,
    constantLeft,
    constantRight,
    solution
  ) {
    return [
      {
        explanation: `Start with the original equation`,
        expression: `${leftSide} = ${rightSide}`,
      },
      {
        explanation: `Move all terms with ${variable} to the left side and all constants to the right side`,
        expression: `${coefficient}${variable} = ${rightSide} - ${constantLeft}`,
      },
      {
        explanation: `Simplify the right side`,
        expression: `${coefficient}${variable} = ${
          constantRight - constantLeft
        }`,
      },
      {
        explanation: `Divide both sides by the coefficient of ${variable}`,
        expression: `${variable} = ${
          (constantRight - constantLeft) / coefficient
        }`,
      },
    ];
  }
}

module.exports = new AlgebraEquationSolver();

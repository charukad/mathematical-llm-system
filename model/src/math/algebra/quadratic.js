const math = require("mathjs");

/**
 * Functions for solving quadratic equations of the form ax² + bx + c = 0
 */
class QuadraticEquationSolver {
  /**
   * Solves a quadratic equation using the quadratic formula
   *
   * @param {number} a - Coefficient of x²
   * @param {number} b - Coefficient of x
   * @param {number} c - Constant term
   * @returns {Object} Object containing solutions and discriminant
   */
  solveQuadraticFormula(a, b, c) {
    // Calculate the discriminant
    const discriminant = b * b - 4 * a * c;

    // Initialize solutions array
    let solutions = [];

    if (discriminant > 0) {
      // Two real solutions
      const sqrtDiscriminant = Math.sqrt(discriminant);
      const x1 = (-b + sqrtDiscriminant) / (2 * a);
      const x2 = (-b - sqrtDiscriminant) / (2 * a);
      solutions = [x1, x2];
    } else if (discriminant === 0) {
      // One real solution (repeated)
      const x = -b / (2 * a);
      solutions = [x];
    } else {
      // Complex solutions
      const realPart = -b / (2 * a);
      const imaginaryPart = Math.sqrt(-discriminant) / (2 * a);

      // Format complex solutions
      solutions = [
        `${realPart} + ${imaginaryPart}i`,
        `${realPart} - ${imaginaryPart}i`,
      ];
    }

    return {
      discriminant,
      solutions,
      type:
        discriminant > 0
          ? "two_real"
          : discriminant === 0
          ? "one_real"
          : "complex",
    };
  }

  /**
   * Extracts coefficients from a standard form quadratic equation
   *
   * @param {Object} parsedEquation - Parsed equation from the parser
   * @returns {Object} Extracted coefficients a, b, c
   */
  extractCoefficients(parsedEquation) {
    // Get the variable name
    const variable = parsedEquation.variables[0];

    // Move all terms to the left side (make right side zero)
    const leftSide = parsedEquation.leftSide.expression;
    const rightSide = parsedEquation.rightSide.expression;

    // Create expression: left - right
    const expression = `${leftSide} - (${rightSide})`;

    // We need to evaluate the expression for different values of the variable
    // to extract the coefficients
    const scope = {};

    // For a quadratic: f(x) = ax² + bx + c
    // We can find a, b, c using three points:
    // f(0) = c
    // f(1) = a + b + c
    // f(2) = 4a + 2b + c

    // Find c by evaluating at 0
    scope[variable] = 0;
    const c = math.evaluate(expression, scope);

    // Find (a + b + c) by evaluating at 1
    scope[variable] = 1;
    const aPlusBC = math.evaluate(expression, scope);

    // Find (4a + 2b + c) by evaluating at 2
    scope[variable] = 2;
    const fourAPlusTwoBPlusC = math.evaluate(expression, scope);

    // Solve the system to find a and b
    // We have:
    // a + b + c = aPlusBC
    // 4a + 2b + c = fourAPlusTwoBPlusC

    // Subtract first equation: 3a + b = fourAPlusTwoBPlusC - aPlusBC
    const threeAPlusB = fourAPlusTwoBPlusC - aPlusBC;

    // Solve for a: 2a = threeAPlusB - (aPlusBC - c)
    const twoA = threeAPlusB - (aPlusBC - c);
    const a = twoA / 2;

    // Now find b: b = aPlusBC - a - c
    const b = aPlusBC - a - c;

    return { a, b, c, variable };
  }

  /**
   * Solves a quadratic equation and generates step-by-step solution
   *
   * @param {string} equationString - The quadratic equation as a string
   * @returns {Object} Solution information
   */
  solveQuadraticEquation(parsedEquation) {
    try {
      // Extract coefficients
      const { a, b, c, variable } = this.extractCoefficients(parsedEquation);

      // Check if it's actually quadratic
      if (Math.abs(a) < 1e-10) {
        // Close to zero - it's a linear equation
        return {
          solved: false,
          error: "Not a quadratic equation",
          details: "The coefficient of the squared term is zero or negligible.",
        };
      }

      // Solve the equation
      const solution = this.solveQuadraticFormula(a, b, c);

      // Generate solution steps
      const steps = this.generateQuadraticSolutionSteps(
        a,
        b,
        c,
        variable,
        solution
      );

      // Format solutions for LaTeX
      let solutionLatex;
      if (solution.type === "complex") {
        // Format complex solutions
        const [sol1, sol2] = solution.solutions;
        solutionLatex = `${variable} = ${sol1}\\text{ or }${variable} = ${sol2}`;
      } else if (solution.type === "one_real") {
        solutionLatex = `${variable} = ${solution.solutions[0]}`;
      } else {
        solutionLatex = `${variable} = ${solution.solutions[0]}\\text{ or }${variable} = ${solution.solutions[1]}`;
      }

      return {
        solved: true,
        equation: parsedEquation.expressionString,
        coefficients: { a, b, c },
        variable,
        discriminant: solution.discriminant,
        solutionType: solution.type,
        solutions: solution.solutions,
        steps,
        latex: {
          equation: parsedEquation.latex,
          solution: solutionLatex,
        },
      };
    } catch (error) {
      console.error("Error solving quadratic equation:", error);
      return {
        solved: false,
        error: "Failed to solve quadratic equation",
        details: error.message,
      };
    }
  }

  /**
   * Generates step-by-step solution for a quadratic equation
   */
  generateQuadraticSolutionSteps(a, b, c, variable, solution) {
    // Format coefficients for display
    const formatNumber = (num) => {
      if (num === 0) return "0";
      if (num === Math.floor(num)) return num.toString();
      return num.toFixed(3).replace(/\.?0+$/, "");
    };

    const aStr = formatNumber(a);
    const bStr = formatNumber(b);
    const cStr = formatNumber(c);

    const steps = [
      {
        explanation:
          "Identify the standard form of a quadratic equation: ax² + bx + c = 0",
        expression: `${aStr}${variable}² + ${bStr}${variable} + ${cStr} = 0`,
      },
      {
        explanation:
          "Apply the quadratic formula: x = (-b ± √(b² - 4ac)) / (2a)",
        expression: `${variable} = \\frac{-${bStr} \\pm \\sqrt{${bStr}^2 - 4 \\cdot ${aStr} \\cdot ${cStr}}}{2 \\cdot ${aStr}}`,
      },
      {
        explanation: "Calculate the discriminant: b² - 4ac",
        expression: `\\text{Discriminant} = ${bStr}^2 - 4 \\cdot ${aStr} \\cdot ${cStr} = ${solution.discriminant}`,
      },
    ];

    if (solution.type === "complex") {
      steps.push({
        explanation:
          "The discriminant is negative, so there are two complex solutions",
        expression: `${variable} = \\frac{-${bStr} \\pm \\sqrt{${Math.abs(
          solution.discriminant
        )}}i}{${2 * a}}`,
      });
      steps.push({
        explanation: "Simplify to get the two complex solutions",
        expression: `${variable} = ${solution.solutions[0]}\\text{ or }${variable} = ${solution.solutions[1]}`,
      });
    } else if (solution.type === "one_real") {
      steps.push({
        explanation:
          "The discriminant is zero, so there is one repeated real solution",
        expression: `${variable} = \\frac{-${bStr}}{${2 * a}} = ${
          solution.solutions[0]
        }`,
      });
    } else {
      steps.push({
        explanation:
          "The discriminant is positive, so there are two real solutions",
        expression: `${variable} = \\frac{-${bStr} + \\sqrt{${
          solution.discriminant
        }}}{${2 * a}} = ${
          solution.solutions[0]
        }\\text{ or }${variable} = \\frac{-${bStr} - \\sqrt{${
          solution.discriminant
        }}}{${2 * a}} = ${solution.solutions[1]}`,
      });
    }

    return steps;
  }
}

module.exports = new QuadraticEquationSolver();

const quadraticEquations = require("../quadratic");
const parser = require("../../parser");

describe("QuadraticEquationSolver", () => {
  describe("solveQuadraticFormula", () => {
    test("should solve a quadratic with two real solutions", () => {
      const result = quadraticEquations.solveQuadraticFormula(1, 5, 6);

      expect(result.discriminant).toBe(25 - 24); // b² - 4ac
      expect(result.type).toBe("two_real");
      expect(result.solutions).toHaveLength(2);
      expect(result.solutions).toContain(-2);
      expect(result.solutions).toContain(-3);
    });

    test("should solve a quadratic with one real solution", () => {
      const result = quadraticEquations.solveQuadraticFormula(1, 4, 4);

      expect(result.discriminant).toBe(0);
      expect(result.type).toBe("one_real");
      expect(result.solutions).toHaveLength(1);
      expect(result.solutions[0]).toBe(-2);
    });

    test("should solve a quadratic with complex solutions", () => {
      const result = quadraticEquations.solveQuadraticFormula(1, 0, 1);

      expect(result.discriminant).toBe(-4);
      expect(result.type).toBe("complex");
      expect(result.solutions).toHaveLength(2);
      expect(result.solutions[0]).toContain("i");
      expect(result.solutions[1]).toContain("i");
    });
  });

  describe("extractCoefficients", () => {
    test("should extract coefficients from a quadratic equation", () => {
      const parsedEquation = parser.parseExpression("x² + 5x + 6 = 0");
      const result = quadraticEquations.extractCoefficients(parsedEquation);

      expect(result.a).toBeCloseTo(1);
      expect(result.b).toBeCloseTo(5);
      expect(result.c).toBeCloseTo(6);
      expect(result.variable).toBe("x");
    });

    test("should handle negative coefficients", () => {
      const parsedEquation = parser.parseExpression("x² - 3x - 10 = 0");
      const result = quadraticEquations.extractCoefficients(parsedEquation);

      expect(result.a).toBeCloseTo(1);
      expect(result.b).toBeCloseTo(-3);
      expect(result.c).toBeCloseTo(-10);
    });
  });

  describe("solveQuadraticEquation", () => {
    test("should generate solution steps", () => {
      const parsedEquation = parser.parseExpression("x² + 5x + 6 = 0");
      const result = quadraticEquations.solveQuadraticEquation(parsedEquation);

      expect(result.solved).toBe(true);
      expect(result.solutions).toHaveLength(2);
      expect(result.solutions).toContain(-2);
      expect(result.solutions).toContain(-3);
      expect(result.steps).toBeInstanceOf(Array);
      expect(result.steps.length).toBeGreaterThan(0);
    });
  });
});

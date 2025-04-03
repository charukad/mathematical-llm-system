const algebraEquations = require("../equations");

describe("AlgebraEquationSolver", () => {
  describe("solveLinearEquation", () => {
    test("should solve a simple linear equation", () => {
      const result = algebraEquations.solveLinearEquation("2x + 3 = 7");

      expect(result.solved).toBe(true);
      expect(result.variable).toBe("x");
      expect(result.solutions).toBe(2);
    });

    test("should solve an equation with a negative constant", () => {
      const result = algebraEquations.solveLinearEquation("3y - 5 = 10");

      expect(result.solved).toBe(true);
      expect(result.variable).toBe("y");
      expect(result.solutions).toBe(5);
    });

    test("should handle invalid input", () => {
      const result = algebraEquations.solveLinearEquation("not an equation");

      expect(result.solved).toBe(false);
      expect(result.error).toBeTruthy();
    });

    test("should generate step-by-step solutions", () => {
      const result = algebraEquations.solveLinearEquation("4z + 8 = 20");

      expect(result.solved).toBe(true);
      expect(result.steps).toBeInstanceOf(Array);
      expect(result.steps.length).toBeGreaterThan(0);

      // Check if the steps make sense
      const firstStep = result.steps[0];
      expect(firstStep.explanation).toContain("Start with");
      expect(firstStep.expression).toBe("4z + 8 = 20");

      const lastStep = result.steps[result.steps.length - 1];
      expect(lastStep.explanation).toContain("Divide");
      expect(lastStep.expression).toContain("z = 3");
    });

    test("should handle equations with multiple variables", () => {
      const result = algebraEquations.solveLinearEquation("2x + 3y = 10");

      // This should fail because we can only solve for one variable
      expect(result.solved).toBe(false);
      expect(result.error).toContain("Invalid number of variables");
    });
  });
});

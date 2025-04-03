const mathService = require("../math_service");
const modelManager = require("../../llm/model_manager");

// Mock the model manager
jest.mock("../../llm/model_manager", () => ({
  generateText: jest.fn().mockResolvedValue(`
Step 1: Start with the original equation
2x + 3 = 7

Step 2: Move all constants to the right side
2x = 7 - 3

Step 3: Simplify the right side
2x = 4

Step 4: Divide both sides by the coefficient
x = 2

Final Answer: x = 2
  `),
}));

describe("MathService", () => {
  describe("solveProblem", () => {
    test("should solve a linear equation", async () => {
      const result = await mathService.solveProblem("2x + 3 = 7");

      expect(result.domain).toBe("algebra");
      expect(result.expressions[0].type).toBe("equation");
      expect(result.steps).toBeTruthy();
    });

    test("should handle word problems", async () => {
      const result = await mathService.solveProblem(
        "What is x if 5x - 2 = 18?"
      );

      expect(result.domain).toBe("algebra");
      expect(result.steps).toBeTruthy();
    });

    test("should detect domain correctly", async () => {
      // Test calculus domain detection
      let result = await mathService.solveProblem(
        "Find the derivative of f(x) = x^2 + 3x"
      );
      expect(result.domain).toBe("calculus");

      // Test statistics domain detection
      result = await mathService.solveProblem(
        "Calculate the probability of getting heads twice in a row"
      );
      expect(result.domain).toBe("statistics");
    });
  });

  describe("extractExpressions", () => {
    test("should extract equation from text", () => {
      const expressions = mathService.extractExpressions(
        "Solve the equation 4z + 8 = 20"
      );

      expect(expressions.length).toBeGreaterThan(0);
      expect(expressions[0].type).toBe("equation");
      expect(expressions[0].expressionString).toBe("4z + 8 = 20");
    });

    test("should handle word problems", () => {
      const expressions = mathService.extractExpressions(
        "What is x if 5x - 2 = 18?"
      );

      expect(expressions.length).toBeGreaterThan(0);
      expect(expressions[0].expressionString).toBe("5x - 2 = 18");
    });
  });

  describe("parseStepsFromLLMResponse", () => {
    test("should parse LLM response into steps", () => {
      const llmResponse = `
Step 1: Start with the original equation
2x + 3 = 7

Step 2: Move all constants to the right side
2x = 7 - 3

Step 3: Simplify the right side
2x = 4

Step 4: Divide both sides by the coefficient
x = 2

Final Answer: x = 2
      `;

      const steps = mathService.parseStepsFromLLMResponse(llmResponse);

      expect(steps.length).toBe(4);
      expect(steps[0].step).toBe(1);
      expect(steps[0].explanation).toBe("Start with the original equation");
      expect(steps[0].expression).toBe("2x + 3 = 7");

      expect(steps[3].step).toBe(4);
      expect(steps[3].expression).toBe("x = 2");
    });
  });
});

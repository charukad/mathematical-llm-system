const parser = require("../math/parser");
const algebraEquations = require("../math/algebra/equations");
const modelManager = require("../llm/model_manager");
const algebraPrompts = require("../llm/prompts/algebra");

/**
 * Service that integrates the math parser, solvers, and LLM
 * to provide comprehensive mathematical solutions
 */
class MathService {
  /**
   * Solves a mathematical problem using appropriate solvers and LLM
   *
   * @param {string} problemText - The text describing the math problem
   * @param {Object} options - Solution options
   * @returns {Promise<Object>} The solution with steps and explanations
   */
  async solveProblem(problemText, options = {}) {
    try {
      // 1. Extract and parse mathematical expressions
      const expressions = this.extractExpressions(problemText);

      if (expressions.length === 0) {
        // If no expression was detected, use LLM to interpret the problem
        return this.solveWithLLM(problemText, options);
      }

      // 2. Determine problem type and select appropriate solver
      const mainExpression = expressions[0]; // Use the first expression for now
      const domain = this.determineDomain(problemText, mainExpression);

      // 3. Solve with appropriate method based on type
      let solution;

      if (domain === "algebra" && mainExpression.type === "equation") {
        // Use algebra solver for equations
        solution = await this.solveAlgebraicEquation(
          mainExpression.expressionString,
          options
        );
      } else {
        // For other types, use LLM with parsed expression context
        solution = await this.solveWithLLM(problemText, {
          ...options,
          parsedExpression: mainExpression,
        });
      }

      return {
        problem: problemText,
        domain,
        expressions,
        ...solution,
      };
    } catch (error) {
      console.error("Error solving math problem:", error);
      return {
        error: `Failed to solve problem: ${error.message}`,
        problem: problemText,
      };
    }
  }

  /**
   * Extracts mathematical expressions from problem text
   *
   * @param {string} text - The problem text
   * @returns {Array} Array of parsed expressions
   */
  extractExpressions(text) {
    // Simple regex to find potential expressions
    // This will be enhanced in future iterations
    const expressionRegex =
      /\$([^$]+)\$|`([^`]+)`|([a-zA-Z0-9+\-*/^(){}[\]=><.,\s]+)/g;
    const matches = [...text.matchAll(expressionRegex)];

    const expressions = [];
    for (const match of matches) {
      const expressionText = match[1] || match[2] || match[3];
      if (expressionText && expressionText.trim()) {
        try {
          const parsed = parser.parseExpression(expressionText.trim());
          if (parsed.parsed) {
            expressions.push(parsed);
          }
        } catch (e) {
          // Not a valid expression, skip
        }
      }
    }

    return expressions;
  }

  /**
   * Determines the mathematical domain of a problem
   *
   * @param {string} text - The problem text
   * @param {Object} expression - The parsed expression
   * @returns {string} The domain name
   */
  determineDomain(text, expression) {
    const lowerText = text.toLowerCase();

    // Simple keyword matching for domain determination
    if (
      lowerText.includes("derivative") ||
      lowerText.includes("integral") ||
      lowerText.includes("differentiate")
    ) {
      return "calculus";
    }

    if (
      lowerText.includes("matrix") ||
      lowerText.includes("vector") ||
      lowerText.includes("eigenvalue")
    ) {
      return "linearAlgebra";
    }

    if (
      lowerText.includes("probability") ||
      lowerText.includes("statistics") ||
      lowerText.includes("distribution")
    ) {
      return "statistics";
    }

    // Default to algebra
    return "algebra";
  }

  /**
   * Solves an algebraic equation
   *
   * @param {string} equation - The equation as a string
   * @param {Object} options - Solution options
   * @returns {Promise<Object>} The solution
   */
  async solveAlgebraicEquation(equation, options = {}) {
    // First try to solve using the algebra solver
    const solution = algebraEquations.solveLinearEquation(equation);

    // If we have a valid solution but want enhanced explanations, use the LLM
    if (solution.solved && options.enhanceExplanation) {
      const enhancedSteps = await this.enhanceExplanation(
        equation,
        solution,
        options
      );
      solution.steps = enhancedSteps;
    }

    return solution;
  }

  /**
   * Uses the LLM to enhance solution explanations
   *
   * @param {string} equation - The equation
   * @param {Object} solution - The basic solution
   * @param {Object} options - Enhancement options
   * @returns {Promise<Array>} Enhanced solution steps
   */
  async enhanceExplanation(equation, solution, options = {}) {
    const prompt = algebraPrompts.buildSolveEquationPrompt(equation, {
      ...options,
      detailLevel: options.detailLevel || "detailed",
    });

    const llmResponse = await modelManager.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more precise math
      max_new_tokens: 512,
    });

    // Parse the LLM response to extract steps
    // This is a simplified version that will be improved
    const steps = llmResponse
      .split("Step")
      .slice(1) // Skip text before first step
      .map((step) => {
        const [numberAndDesc, ...rest] = step.split("\n");
        const description = numberAndDesc.split(":").slice(1).join(":").trim();
        const expression = rest.join("\n").trim();

        return {
          explanation: description,
          expression,
        };
      });

    return steps;
  }

  /**
   * Solves a problem using only the LLM
   *
   * @param {string} problemText - The problem text
   * @param {Object} options - Solution options
   * @returns {Promise<Object>} The solution
   */
  async solveWithLLM(problemText, options = {}) {
    // For algebra problems, we'll use the algebra prompt template
    const prompt = algebraPrompts.buildSolveEquationPrompt(
      problemText,
      options
    );

    const llmResponse = await modelManager.generateText(prompt, {
      temperature: 0.3,
      max_new_tokens: 512,
    });

    // Parse the LLM response to extract solution
    // This is a simplified version that will be improved
    const steps = llmResponse
      .split("Step")
      .slice(1)
      .map((step) => {
        const [numberAndDesc, ...rest] = step.split("\n");
        const description = numberAndDesc.split(":").slice(1).join(":").trim();
        const expression = rest.join("\n").trim();

        return {
          explanation: description,
          expression,
        };
      });

    // Extract final answer
    const finalAnswerMatch = llmResponse.match(/Final Answer:(.+)/);
    const finalAnswer = finalAnswerMatch
      ? finalAnswerMatch[1].trim()
      : "No final answer provided";

    return {
      solved: true,
      steps,
      result: finalAnswer,
      llmGenerated: true,
    };
  }
}

module.exports = new MathService();

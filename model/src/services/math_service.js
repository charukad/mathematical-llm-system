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
      } else if (
        domain === "algebra" &&
        mainExpression.type === "word_problem"
      ) {
        // For word problems, use LLM with contextual information
        solution = await this.solveWithLLM(problemText, {
          ...options,
          problemType: "word_problem",
          domain: "algebra",
        });
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
    // Better regex to find potential equations and expressions
    const equationRegex =
      /\$([^$]+)\$|`([^`]+)`|(\b[a-z][a-z0-9]*\s*[\+\-\*\/]\s*\d+\s*\=\s*\d+\b)|((?:\d+)?[a-z](?:\s*[\+\-\*\/]\s*(?:\d+)?[a-z])*\s*(?:[\+\-\*\/]\s*\d+)?\s*\=\s*\d+)/gi;
    const matches = [...text.matchAll(equationRegex)];

    const expressions = [];
    for (const match of matches) {
      const expressionText = match[1] || match[2] || match[3] || match[4];
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

    // If no expressions found with the equation regex, try a more general approach
    if (expressions.length === 0) {
      // Extract word problems by looking for key phrases
      const wordProblemKeywords =
        /what is [a-z]|solve for [a-z]|find the value of [a-z]/i;
      if (wordProblemKeywords.test(text)) {
        // This is likely a word problem, try to extract the entire text
        return [
          {
            parsed: true,
            expressionString: text,
            type: "word_problem",
          },
        ];
      }

      // Try to find any mathematical expressions
      const expressionRegex =
        /\b\d+\s*[\+\-\*\/]\s*\d+\b|\b[a-z]\s*[\+\-\*\/]\s*\d+\b/gi;
      const exprMatches = [...text.matchAll(expressionRegex)];

      for (const match of exprMatches) {
        try {
          const parsed = parser.parseExpression(match[0].trim());
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
      lowerText.includes("differentiate") ||
      lowerText.includes("rate of change")
    ) {
      return "calculus";
    }

    if (
      lowerText.includes("matrix") ||
      lowerText.includes("vector") ||
      lowerText.includes("eigenvalue") ||
      lowerText.includes("linear system")
    ) {
      return "linearAlgebra";
    }

    if (
      lowerText.includes("probability") ||
      lowerText.includes("statistics") ||
      lowerText.includes("distribution") ||
      lowerText.includes("average") ||
      lowerText.includes("standard deviation")
    ) {
      return "statistics";
    }

    // Check expression type if available
    if (expression && expression.type) {
      if (expression.type === "derivative" || expression.type === "integral") {
        return "calculus";
      }
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

    // If direct solving failed, fall back to LLM
    if (!solution.solved) {
      return this.solveWithLLM(equation, {
        ...options,
        detailLevel: "detailed",
      });
    }

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
      baseSteps: solution.steps,
    });

    const llmResponse = await modelManager.generateText(prompt, {
      temperature: 0.3, // Lower temperature for more precise math
      max_new_tokens: 512,
    });

    // Parse the LLM response to extract steps
    const steps = this.parseStepsFromLLMResponse(llmResponse);

    return steps.length > 0 ? steps : solution.steps;
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
    const steps = this.parseStepsFromLLMResponse(llmResponse);

    // Extract final answer
    const finalAnswerMatch = llmResponse.match(/Final Answer:(.+?)(?:\n|$)/s);
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

  /**
   * Parses step-by-step solution from LLM response
   *
   * @param {string} llmResponse - The raw LLM response text
   * @returns {Array} Structured solution steps
   */
  parseStepsFromLLMResponse(llmResponse) {
    // Split by step indicators
    const stepMatches =
      llmResponse.match(/Step \d+:[\s\S]*?(?=Step \d+:|Final Answer:|$)/g) ||
      [];

    if (stepMatches.length === 0) {
      return [];
    }

    return stepMatches.map((stepText) => {
      // Extract step number and description
      const stepHeaderMatch = stepText.match(/Step (\d+):(.*?)(?:\n|$)/);

      if (!stepHeaderMatch) {
        return {
          explanation: "Parsing error",
          expression: stepText.trim(),
        };
      }

      const [_, number, description] = stepHeaderMatch;
      // The rest is the expression/explanation part
      const expressionPart = stepText.slice(stepHeaderMatch[0].length).trim();

      return {
        step: parseInt(number),
        explanation: description.trim(),
        expression: expressionPart,
      };
    });
  }

  /**
   * Creates visualization configurations for solutions
   *
   * @param {string} domain - The mathematical domain
   * @param {Object} expression - The parsed expression
   * @param {Object} solution - The solution object
   * @returns {Object} Visualization configuration
   */
  generateVisualizationConfig(domain, expression, solution) {
    // This is a placeholder for visualization generation
    // We'll implement this more fully in a future step

    if (domain === "algebra" && expression.type === "equation") {
      return {
        type: "equation",
        data: {
          equation: expression.expressionString,
          solution: solution.result,
        },
      };
    }

    if (domain === "algebra" && expression.type === "function") {
      return {
        type: "function_plot",
        data: {
          function: expression.expressionString,
          xRange: [-10, 10],
          yRange: [-10, 10],
        },
      };
    }

    // Default empty visualization
    return null;
  }
}

module.exports = new MathService();

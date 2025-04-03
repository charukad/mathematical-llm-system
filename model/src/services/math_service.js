const parser = require("../math/parser");
const algebraEquations = require("../math/algebra/equations");
const quadraticEquations = require("../math/algebra/quadratic");
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

      if (domain === "algebra") {
        if (mainExpression.type === "equation") {
          // Check if it's a quadratic equation by looking for x² terms
          const hasSquaredTerm = this.checkForQuadraticTerms(mainExpression);

          if (hasSquaredTerm) {
            // Use quadratic equation solver
            solution = await this.solveQuadraticEquation(
              mainExpression,
              options
            );
          } else {
            // Use linear equation solver
            solution = await this.solveAlgebraicEquation(
              mainExpression.expressionString,
              options
            );
          }
        } else if (mainExpression.type === "word_problem") {
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
      } else {
        // For non-algebra domains (calculus, statistics, etc.), use LLM
        solution = await this.solveWithLLM(problemText, {
          ...options,
          parsedExpression: mainExpression,
          domain,
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
      /\$([^$]+)\$|`([^`]+)`|(\b[a-z][a-z0-9]*\s*[\+\-\*\/]\s*\d+\s*\=\s*\d+\b)|((?:\d+)?[a-z](?:\s*[\+\-\*\/]\s*(?:\d+)?[a-z])*\s*(?:[\+\-\*\/]\s*\d+)?\s*\=\s*\d+)|([a-z]\^2|[a-z]²)|(\d*[a-z]\^2\s*[\+\-]\s*\d+[a-z]\s*[\+\-]\s*\d+\s*\=\s*\d+)/gi;
    const matches = [...text.matchAll(equationRegex)];

    const expressions = [];
    for (const match of matches) {
      const expressionText =
        match[1] || match[2] || match[3] || match[4] || match[5] || match[6];
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
        /what is [a-z]|solve for [a-z]|find the value of [a-z]|solve the equation/i;
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
   * Checks if an expression contains quadratic terms
   *
   * @param {Object} expression - The parsed expression
   * @returns {boolean} True if the expression contains squared terms
   */
  checkForQuadraticTerms(expression) {
    // Check if the expression string contains a squared term
    if (
      expression.expressionString.includes("²") ||
      expression.expressionString.includes("^2")
    ) {
      return true;
    }

    // For more complex detection, check the parsed structure
    // This is a simplified approach and might need enhancement
    if (expression.leftSide && expression.leftSide.node) {
      let hasSquaredTerm = false;

      expression.leftSide.node.traverse((node) => {
        if (node.isOperatorNode && node.fn === "pow") {
          // Check if the exponent is 2
          if (node.args[1].isConstantNode && node.args[1].value === 2) {
            hasSquaredTerm = true;
          }
        }
      });

      return hasSquaredTerm;
    }

    return false;
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
   * Solves a quadratic equation
   *
   * @param {Object} expression - The parsed expression
   * @param {Object} options - Solution options
   * @returns {Promise<Object>} The solution
   */
  async solveQuadraticEquation(expression, options = {}) {
    // Solve using the quadratic equation solver
    const solution = quadraticEquations.solveQuadraticEquation(expression);

    // If direct solving failed, fall back to LLM
    if (!solution.solved) {
      return this.solveWithLLM(expression.expressionString, {
        ...options,
        detailLevel: "detailed",
      });
    }

    // If we have a valid solution but want enhanced explanations, use the LLM
    if (solution.solved && options.enhanceExplanation) {
      const enhancedSteps = await this.enhanceQuadraticExplanation(
        expression.expressionString,
        solution,
        options
      );
      solution.steps = enhancedSteps;
    }

    return solution;
  }

  /**
   * Uses the LLM to enhance quadratic explanations
   *
   * @param {string} equation - The quadratic equation
   * @param {Object} solution - The solution object
   * @param {Object} options - Enhancement options
   * @returns {Promise<Array>} Enhanced solution steps
   */
  async enhanceQuadraticExplanation(equation, solution, options = {}) {
    const prompt = `You are a helpful math assistant that explains quadratic equations.
Please provide a step-by-step solution for the following quadratic equation:
${equation}

This is a quadratic equation with coefficients:
a = ${solution.coefficients.a}
b = ${solution.coefficients.b}
c = ${solution.coefficients.c}

The discriminant is ${solution.discriminant}, which means there are ${
      solution.solutionType === "two_real"
        ? "two real solutions"
        : solution.solutionType === "one_real"
        ? "one repeated real solution"
        : "two complex solutions"
    }.

Please give a very detailed explanation for each step.

Format your answer as follows:
Step 1: [First step description]
[Mathematical expression]

Step 2: [Second step description]
[Mathematical expression]

...

Final Answer: [The solution]`;

    const llmResponse = await modelManager.generateText(prompt, {
      temperature: 0.3,
      max_new_tokens: 512,
    });

    // Parse the LLM response to extract steps
    const steps = this.parseStepsFromLLMResponse(llmResponse);
    return steps.length > 0 ? steps : solution.steps;
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
      // Check if it's a quadratic equation
      if (solution.coefficients && solution.coefficients.a) {
        return {
          type: "quadratic",
          data: {
            coefficients: solution.coefficients,
            solutions: solution.solutions,
          },
        };
      }

      // Linear equation
      return {
        type: "linear",
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

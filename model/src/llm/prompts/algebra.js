/**
 * Prompt templates for algebra problems
 */
class AlgebraPromptTemplates {
  /**
   * Creates a prompt for solving an algebraic equation
   *
   * @param {string} problem - The problem statement or equation
   * @param {Object} options - Additional options for customizing the prompt
   * @returns {string} The formatted prompt
   */
  buildSolveEquationPrompt(problem, options = {}) {
    const { detailLevel = "standard", parsedExpression = null } = options;

    // Base template with system context
    let prompt = `You are a helpful math assistant that solves algebraic problems step by step.
  Your task is to solve the following equation and explain each step clearly.
  
  Problem: ${problem}`;

    // Add parsed expression info if available
    if (parsedExpression && parsedExpression.parsed) {
      prompt += `\n\nParsed as: ${parsedExpression.expressionString}
  Type: ${parsedExpression.type}
  Variables: ${parsedExpression.variables.join(", ")}`;
    }

    // Adjust detail level
    if (detailLevel === "basic") {
      prompt += "\n\nProvide a brief solution with minimal steps.";
    } else if (detailLevel === "detailed") {
      prompt +=
        "\n\nProvide a very detailed solution, explaining the mathematical reasoning behind each step. Include relevant formulas and concepts.";
    } else {
      prompt +=
        "\n\nProvide a clear step-by-step solution that balances detail with clarity.";
    }

    // Add output formatting instructions
    prompt += `\n\nFormat your answer as follows:
  Step 1: [First step description]
  [Mathematical expression]
  
  Step 2: [Second step description]
  [Mathematical expression]
  
  ...
  
  Final Answer: [The solution]`;

    return prompt;
  }

  /**
   * Creates a prompt for explaining an algebraic concept
   *
   * @param {string} concept - The concept to explain
   * @param {Object} options - Additional options for customizing the prompt
   * @returns {string} The formatted prompt
   */
  buildConceptExplanationPrompt(concept, options = {}) {
    const { detailLevel = "standard", includeExamples = true } = options;

    let prompt = `You are a helpful math assistant that explains algebraic concepts clearly.
  Your task is to explain the following concept: ${concept}`;

    // Adjust detail level
    if (detailLevel === "basic") {
      prompt +=
        "\n\nProvide a brief, simple explanation suitable for beginners.";
    } else if (detailLevel === "detailed") {
      prompt +=
        "\n\nProvide a comprehensive explanation with mathematical details and connections to other concepts.";
    } else {
      prompt +=
        "\n\nProvide a clear explanation that balances simplicity with mathematical accuracy.";
    }

    // Include examples if requested
    if (includeExamples) {
      prompt +=
        "\n\nInclude 2-3 practical examples that illustrate the concept.";
    }

    return prompt;
  }
}

module.exports = new AlgebraPromptTemplates();

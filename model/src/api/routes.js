const express = require("express");
const mathService = require("../services/math_service");

const router = express.Router();

/**
 * Endpoint for solving mathematical problems
 */
router.post("/solve", async (req, res) => {
  try {
    const { problem, options = {} } = req.body;

    if (!problem) {
      return res.status(400).json({
        error: "Problem text is required",
      });
    }

    // Call math service to solve the problem
    const solution = await mathService.solveProblem(problem, options);

    return res.json(solution);
  } catch (error) {
    console.error("Error in /solve endpoint:", error);
    return res.status(500).json({
      error: "Failed to solve problem",
      details: error.message,
    });
  }
});

/**
 * Endpoint for getting information about a mathematical expression
 */
router.post("/parse", async (req, res) => {
  try {
    const { expression } = req.body;

    if (!expression) {
      return res.status(400).json({
        error: "Expression is required",
      });
    }

    // Parse the expression
    const parser = require("../math/parser");
    const parsed = parser.parseExpression(expression);

    return res.json(parsed);
  } catch (error) {
    console.error("Error in /parse endpoint:", error);
    return res.status(500).json({
      error: "Failed to parse expression",
      details: error.message,
    });
  }
});

module.exports = router;

/**
 * Test script for the quadratic equation solver
 */
const mathService = require("../src/services/math_service");

// Test problems
const testProblems = [
  "x² + 5x + 6 = 0",
  "x² - 4 = 0",
  "2x² - 4x + 1 = 0",
  "Solve the equation 3x² + 6x - 9 = 0",
  "What are the solutions to x² + 1 = 0?",
];

// Test each problem
async function runTests() {
  console.log("Testing quadratic equation solver with mock LLM...\n");

  for (const problem of testProblems) {
    console.log(`Problem: ${problem}`);
    try {
      console.log("Solving...");
      const solution = await mathService.solveProblem(problem);
      console.log("Solution:");
      console.log(JSON.stringify(solution, null, 2));
    } catch (error) {
      console.error("Error solving problem:", error.message);
    }
    console.log("\n-------------------\n");
  }
}

// Run the tests
runTests()
  .then(() => {
    console.log("All tests completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Test failed:", err);
    process.exit(1);
  });

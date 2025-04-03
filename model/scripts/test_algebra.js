/**
 * Test script for the algebra solver
 */
const mathService = require("../src/services/math_service");

// Test problems
const testProblems = [
  "2x + 3 = 7",
  "3y - 5 = 10",
  "Solve the equation 4z + 8 = 20",
  "What is x if 5x - 2 = 18?",
];

// Test each problem
async function runTests() {
  console.log("Testing algebra solver with mock LLM...\n");

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

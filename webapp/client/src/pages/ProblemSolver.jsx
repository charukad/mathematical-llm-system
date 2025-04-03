import React, { useState } from "react";
import MathProblemInput from "../components/math/MathProblemInput";
import SolutionDisplay from "../components/math/SolutionDisplay";
import FunctionPlot from "../components/visualization/FunctionPlot";
import { solveMathProblem } from "../services/mathService";

function ProblemSolver() {
  const [solution, setSolution] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSolveProblem = async (problem) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await solveMathProblem(problem);
      setSolution(result);
    } catch (err) {
      setError(err.message || "Failed to solve the problem. Please try again.");
      setSolution(null);
    } finally {
      setIsLoading(false);
    }
  };

  const showVisualization =
    solution &&
    solution.domain === "algebra" &&
    solution.expressions &&
    solution.expressions[0]?.type === "equation";

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Mathematical Problem Solver
      </h1>

      <MathProblemInput onSolve={handleSolveProblem} isLoading={isLoading} />

      {error && (
        <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {solution && <SolutionDisplay solution={solution} />}

      {showVisualization && (
        <FunctionPlot
          equation={solution.equation}
          variable={solution.variable}
          solution={solution.solutions}
        />
      )}
    </div>
  );
}

export default ProblemSolver;

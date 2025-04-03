import React, { useState } from "react";

function MathProblemInput({ onSolve, isLoading }) {
  const [problem, setProblem] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!problem.trim()) {
      setError("Please enter a mathematical problem");
      return;
    }

    setError("");
    onSolve(problem);
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Math Problem Solver</h2>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="problem"
            className="block text-gray-700 font-medium mb-2"
          >
            Enter your mathematical problem
          </label>
          <textarea
            id="problem"
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Example: 2x + 3 = 7 or Solve for x: 5x - 2 = 18"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>

        <div className="mt-2">
          <div className="text-sm text-gray-600 font-medium">Examples:</div>
          <div className="mt-1 flex flex-wrap gap-2">
            <button
              type="button"
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setProblem("2x + 3 = 7")}
            >
              Linear equation
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setProblem("x² + 5x + 6 = 0")}
            >
              Quadratic with real roots
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setProblem("x² + 1 = 0")}
            >
              Quadratic with complex roots
            </button>
            <button
              type="button"
              className="px-2 py-1 text-xs bg-gray-100 rounded hover:bg-gray-200"
              onClick={() => setProblem("Solve for x: 2x² - 12x + 18 = 0")}
            >
              Word problem
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? "Solving..." : "Solve Problem"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MathProblemInput;

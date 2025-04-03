import React from "react";
import { MathJax } from "better-react-mathjax";
import QuadraticPlot from "../visualization/QuadraticPlot";

function SolutionDisplay({ solution }) {
  if (!solution) {
    return null;
  }

  if (solution.error) {
    return (
      <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800">Error</h3>
        <p className="text-red-700">{solution.error}</p>
        {solution.details && (
          <p className="text-sm text-red-600 mt-2">{solution.details}</p>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-3">Solution</h3>

      <div className="mb-4">
        <p className="font-medium">Problem:</p>
        <div className="p-2 bg-gray-50 rounded">
          <MathJax>
            {`\\(${solution.latex?.equation || solution.problem}\\)`}
          </MathJax>
        </div>
      </div>

      {solution.domain && (
        <div className="mb-4">
          <p className="font-medium">Mathematical Domain:</p>
          <p className="p-2 bg-gray-50 rounded capitalize">{solution.domain}</p>
        </div>
      )}

      {solution.steps && solution.steps.length > 0 && (
        <div className="mb-4">
          <p className="font-medium mb-2">Steps:</p>
          <div className="space-y-3">
            {solution.steps.map((step, index) => (
              <div key={index} className="p-3 bg-blue-50 rounded">
                <p className="font-medium text-blue-800">
                  Step {step.step || index + 1}: {step.explanation}
                </p>
                <div className="mt-1">
                  <MathJax>{`\\(${step.expression}\\)`}</MathJax>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
        <p className="font-medium text-green-800">Final Answer:</p>
        <div className="mt-1">
          <MathJax>{`\\(${
            solution.latex?.solution || solution.result
          }\\)`}</MathJax>
        </div>
      </div>

      {solution.coefficients && solution.coefficients.a && (
        <QuadraticPlot
          coefficients={solution.coefficients}
          solutions={solution.solutions}
        />
      )}
    </div>
  );
}

export default SolutionDisplay;

import React, { useEffect, useRef } from "react";
import functionPlot from "function-plot";

function FunctionPlot({
  equation,
  variable,
  solution,
  width = 500,
  height = 300,
}) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !equation) return;

    try {
      // Clear previous plots
      containerRef.current.innerHTML = "";

      // Extract the left side of the equation (assuming form ax + b = c)
      const leftSide = equation.split("=")[0].trim();

      // Plot the function
      functionPlot({
        target: containerRef.current,
        width,
        height,
        yAxis: { domain: [-10, 10] },
        xAxis: { domain: [-10, 10] },
        grid: true,
        data: [
          {
            fn: leftSide,
            color: "blue",
          },
        ],
      });

      // If we have a solution, mark it with a point
      if (variable && solution) {
        // Convert solution to number if possible
        const solutionValue = Number(solution);
        if (!isNaN(solutionValue)) {
          // Evaluate the function at the solution point
          const fn = math.compile(leftSide);
          const yValue = fn.evaluate({ [variable]: solutionValue });

          // Add the solution point
          functionPlot({
            target: containerRef.current,
            width,
            height,
            yAxis: { domain: [-10, 10] },
            xAxis: { domain: [-10, 10] },
            grid: true,
            data: [
              {
                points: [[solutionValue, yValue]],
                fnType: "points",
                graphType: "scatter",
                color: "red",
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error plotting function:", error);
    }
  }, [equation, variable, solution, width, height]);

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-3">Visualization</h3>
      <div ref={containerRef} className="w-full overflow-x-auto"></div>
    </div>
  );
}

export default FunctionPlot;

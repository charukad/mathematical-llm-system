import React, { useEffect, useRef } from "react";
import functionPlot from "function-plot";

function QuadraticPlot({ coefficients, solutions, width = 500, height = 300 }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !coefficients) return;

    try {
      // Clear previous plots
      containerRef.current.innerHTML = "";

      const { a, b, c } = coefficients;

      // Create a quadratic function in the form f(x) = ax² + bx + c
      const quadraticFn = `${a}*x^2 + ${b}*x + ${c}`;

      // Calculate domain to ensure we see the important parts of the parabola
      // Find the x-coordinate of the vertex: x = -b/(2a)
      const vertexX = -b / (2 * a);

      // Extend the domain to see a good portion of the parabola
      const domainPadding = 5;
      const xDomain = [vertexX - domainPadding, vertexX + domainPadding];

      // Calculate y values at domain boundaries to set appropriate y-range
      const yAtMin = a * Math.pow(xDomain[0], 2) + b * xDomain[0] + c;
      const yAtMax = a * Math.pow(xDomain[1], 2) + b * xDomain[1] + c;
      const vertexY = a * Math.pow(vertexX, 2) + b * vertexX + c;

      // Set y-range based on whether parabola opens up or down
      const yMin =
        a > 0
          ? Math.min(vertexY, yAtMin, yAtMax) - 2
          : Math.min(yAtMin, yAtMax) - 10;
      const yMax =
        a > 0
          ? Math.max(yAtMin, yAtMax) + 10
          : Math.max(vertexY, yAtMin, yAtMax) + 2;

      // Plot the quadratic function
      functionPlot({
        target: containerRef.current,
        width,
        height,
        grid: true,
        xAxis: { domain: xDomain },
        yAxis: { domain: [yMin, yMax] },
        data: [
          {
            fn: quadraticFn,
            color: "#2980b9", // Blue color for the parabola
            graphType: "polyline", // For smooth curve
          },
          // Add a point at the vertex
          {
            points: [[vertexX, vertexY]],
            fnType: "points",
            graphType: "scatter",
            color: "#e74c3c", // Red for vertex
            attr: {
              r: 5, // Radius of the point
            },
          },
        ],
        annotations: [
          // Horizontal line at y=0 (x-axis)
          {
            y: 0,
            color: "#7f8c8d",
            text: "",
          },
        ],
      });

      // If we have real solutions, mark them as points
      if (solutions && Array.isArray(solutions)) {
        const realSolutions = solutions.filter(
          (sol) => !String(sol).includes("i")
        );

        if (realSolutions.length > 0) {
          // Add solution points where the parabola crosses the x-axis
          functionPlot({
            target: containerRef.current,
            width,
            height,
            xAxis: { domain: xDomain },
            yAxis: { domain: [yMin, yMax] },
            disableZoom: true,
            data: [
              {
                points: realSolutions.map((x) => [parseFloat(x), 0]),
                fnType: "points",
                graphType: "scatter",
                color: "#27ae60", // Green for solutions
                attr: {
                  r: 5, // Radius of the point
                },
              },
            ],
          });
        }
      }
    } catch (error) {
      console.error("Error plotting quadratic function:", error);
    }
  }, [coefficients, solutions, width, height]);

  return (
    <div className="max-w-2xl mx-auto mt-6 p-4 bg-white rounded-lg shadow-md">
      <h3 className="text-xl font-bold mb-3">
        Quadratic Function Visualization
      </h3>
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          The graph shows the quadratic function f(x) = {coefficients?.a}x² +{" "}
          {coefficients?.b}x + {coefficients?.c}.
          {coefficients?.a > 0
            ? " The parabola opens upward."
            : " The parabola opens downward."}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
          Vertex point
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full ml-4 mr-1"></span>
          Solutions (x-intercepts)
        </p>
      </div>
      <div ref={containerRef} className="w-full h-64 overflow-x-auto"></div>
    </div>
  );
}

export default QuadraticPlot;

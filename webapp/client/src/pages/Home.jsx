import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          Welcome to the Mathematical Problem Solver
        </h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">
            Solve math problems with step-by-step explanations
          </h2>

          <p className="mb-4">
            Our AI-powered tool can help you solve and understand various
            mathematical problems. Get detailed step-by-step solutions with
            clear explanations to enhance your learning.
          </p>

          <div className="mt-6">
            <Link
              to="/solver"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try the Problem Solver
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-3">Linear Equations</h3>
            <p>
              Solve linear equations like 2x + 3 = 7 with step-by-step
              explanations.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-3">Quadratic Equations</h3>
            <p>
              Solve quadratic equations with real or complex roots, complete
              with interactive visualizations.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-3">Visual Learning</h3>
            <p>
              See functions graphed in real-time with important points
              highlighted for better understanding.
            </p>
          </div>
        </div>

        <div className="mt-10 bg-blue-50 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4 text-blue-800">
            How It Works
          </h2>

          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                1
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  Enter your mathematical problem
                </h3>
                <p className="text-gray-600">
                  Type in any linear or quadratic equation, or even a word
                  problem.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                2
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  Our system analyzes the problem
                </h3>
                <p className="text-gray-600">
                  We use advanced algorithms and AI to understand and solve your
                  problem.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3 mt-1">
                3
              </div>
              <div>
                <h3 className="text-lg font-medium">
                  Get a complete explanation
                </h3>
                <p className="text-gray-600">
                  Receive a detailed step-by-step solution with interactive
                  visualizations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

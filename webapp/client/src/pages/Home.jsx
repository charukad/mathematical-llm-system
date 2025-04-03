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
            <h3 className="text-xl font-semibold mb-3">Algebraic Equations</h3>
            <p>
              Solve linear and quadratic equations with detailed explanations of
              each step.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-3">Visual Learning</h3>
            <p>
              Visualize mathematical concepts with interactive graphs and
              diagrams.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-xl font-semibold mb-3">Natural Language</h3>
            <p>
              Ask questions in plain English and get mathematical solutions in
              response.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

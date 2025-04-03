import React from "react";
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Math LLM System
        </Link>

        <div className="flex space-x-6">
          <Link to="/" className="hover:underline">
            Home
          </Link>
          <Link to="/solver" className="hover:underline">
            Problem Solver
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

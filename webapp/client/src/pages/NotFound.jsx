import React from "react";
import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <h2 className="text-3xl font-semibold mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Go Home
      </Link>
    </div>
  );
}

export default NotFound;

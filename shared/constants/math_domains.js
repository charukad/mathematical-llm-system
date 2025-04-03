// Shared definitions for mathematical domains

const MATH_DOMAINS = {
  ALGEBRA: "algebra",
  CALCULUS: "calculus",
  LINEAR_ALGEBRA: "linearAlgebra",
  STATISTICS: "statistics",
};

// Export for CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MATH_DOMAINS };
}

// Export for ES modules
export { MATH_DOMAINS };

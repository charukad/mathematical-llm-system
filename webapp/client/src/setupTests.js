// Add React Testing Library setup
import "@testing-library/jest-dom";

// Mock MathJax since we don't need actual rendering in tests
jest.mock("better-react-mathjax", () => {
  return {
    MathJax: ({ children }) => <div data-testid="mathjax">{children}</div>,
    MathJaxContext: ({ children }) => <div>{children}</div>,
  };
});

// Mock function-plot
jest.mock("function-plot", () => {
  return jest.fn().mockImplementation(() => {});
});

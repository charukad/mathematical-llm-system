import React from "react";
import { render, screen } from "@testing-library/react";
import SolutionDisplay from "../SolutionDisplay";

// Mock solution data
const mockSolution = {
  problem: "2x + 3 = 7",
  domain: "algebra",
  solved: true,
  variable: "x",
  solutions: 2,
  steps: [
    {
      explanation: "Start with the original equation",
      expression: "2x + 3 = 7",
    },
    {
      explanation:
        "Move all terms with x to the left side and all constants to the right side",
      expression: "2x = 7 - 3",
    },
    {
      explanation: "Simplify the right side",
      expression: "2x = 4",
    },
    {
      explanation: "Divide both sides by the coefficient of x",
      expression: "x = 2",
    },
  ],
  latex: {
    equation: "2x + 3 = 7",
    solution: "x = 2",
  },
};

describe("SolutionDisplay", () => {
  test("renders nothing when no solution provided", () => {
    const { container } = render(<SolutionDisplay solution={null} />);
    expect(container.firstChild).toBeNull();
  });

  test("renders error message when solution has error", () => {
    render(
      <SolutionDisplay
        solution={{ error: "Failed to solve", details: "Invalid input" }}
      />
    );

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.getByText("Failed to solve")).toBeInTheDocument();
    expect(screen.getByText("Invalid input")).toBeInTheDocument();
  });

  test("renders solution correctly", () => {
    render(<SolutionDisplay solution={mockSolution} />);

    expect(screen.getByText("Solution")).toBeInTheDocument();
    expect(screen.getByText("Problem:")).toBeInTheDocument();
    expect(screen.getByText("Steps:")).toBeInTheDocument();
    expect(screen.getByText("Final Answer:")).toBeInTheDocument();

    // Check for step content
    mockSolution.steps.forEach((step, index) => {
      expect(
        screen.getByText(`Step ${index + 1}: ${step.explanation}`)
      ).toBeInTheDocument();
    });
  });
});

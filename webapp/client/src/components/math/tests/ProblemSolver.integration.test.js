import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import ProblemSolver from "../../pages/ProblemSolver";

// Mock axios
jest.mock("axios");

describe("ProblemSolver Integration", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  test("submits problem and displays solution", async () => {
    // Mock API response
    axios.post.mockResolvedValueOnce({
      data: {
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
            explanation: "Solve for x",
            expression: "x = 2",
          },
        ],
        result: "x = 2",
      },
    });

    // Render the component
    render(<ProblemSolver />);

    // Type a problem
    fireEvent.change(
      screen.getByLabelText(/enter your mathematical problem/i),
      {
        target: { value: "2x + 3 = 7" },
      }
    );

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /solve problem/i }));

    // Check if API was called correctly
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining("/math/solve"),
      { problem: "2x + 3 = 7", options: {} },
      expect.anything()
    );

    // Wait for solution to be displayed
    await waitFor(() => {
      expect(screen.getByText("Solution")).toBeInTheDocument();
    });

    expect(screen.getByText("Final Answer:")).toBeInTheDocument();
    expect(
      screen.getByText("Step 1: Start with the original equation")
    ).toBeInTheDocument();
  });

  test("handles API errors", async () => {
    // Mock API error
    axios.post.mockRejectedValueOnce({
      response: {
        data: { error: "Failed to solve problem" },
      },
    });

    // Render the component
    render(<ProblemSolver />);

    // Type a problem
    fireEvent.change(
      screen.getByLabelText(/enter your mathematical problem/i),
      {
        target: { value: "invalid@@@" },
      }
    );

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /solve problem/i }));

    // Wait for error to be displayed
    await waitFor(() => {
      expect(screen.getByText("Failed to solve problem")).toBeInTheDocument();
    });
  });
});

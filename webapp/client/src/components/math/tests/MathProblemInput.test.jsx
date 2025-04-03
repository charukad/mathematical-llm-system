import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MathProblemInput from "../MathProblemInput";

describe("MathProblemInput", () => {
  test("renders the input form", () => {
    render(<MathProblemInput onSolve={() => {}} />);

    expect(
      screen.getByLabelText(/enter your mathematical problem/i)
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /solve problem/i })
    ).toBeInTheDocument();
  });

  test("shows loading state when isLoading is true", () => {
    render(<MathProblemInput onSolve={() => {}} isLoading={true} />);

    expect(
      screen.getByRole("button", { name: /solving/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  test("calls onSolve with the entered problem", () => {
    const handleSolve = jest.fn();
    render(<MathProblemInput onSolve={handleSolve} />);

    // Type a problem
    fireEvent.change(
      screen.getByLabelText(/enter your mathematical problem/i),
      {
        target: { value: "2x + 3 = 7" },
      }
    );

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /solve problem/i }));

    expect(handleSolve).toHaveBeenCalledWith("2x + 3 = 7");
  });

  test("shows error when trying to submit empty input", () => {
    const handleSolve = jest.fn();
    render(<MathProblemInput onSolve={handleSolve} />);

    // Submit with empty input
    fireEvent.click(screen.getByRole("button", { name: /solve problem/i }));

    expect(
      screen.getByText(/please enter a mathematical problem/i)
    ).toBeInTheDocument();
    expect(handleSolve).not.toHaveBeenCalled();
  });
});

describe("Math Problem Solver", () => {
  beforeEach(() => {
    // Visit the problem solver page
    cy.visit("/solver");
  });

  it("should successfully solve a linear equation", () => {
    // Type a linear equation
    cy.get("textarea").type("2x + 3 = 7");

    // Click the solve button
    cy.get("button").contains("Solve Problem").click();

    // Wait for the solution to appear
    cy.get("h3").contains("Solution").should("be.visible");

    // Check if steps are displayed
    cy.contains("Start with the original equation").should("be.visible");

    // Check if the final answer is correct
    cy.contains("Final Answer:").should("be.visible");
    cy.contains("x = 2").should("be.visible");
  });

  it("should handle word problems", () => {
    // Type a word problem
    cy.get("textarea").type("What is x if 5x - 2 = 18?");

    // Click the solve button
    cy.get("button").contains("Solve Problem").click();

    // Wait for the solution to appear
    cy.get("h3").contains("Solution").should("be.visible");

    // Check if the final answer is correct
    cy.contains("Final Answer:").should("be.visible");
    cy.contains("x = 4").should("be.visible");
  });

  it("should display error for invalid input", () => {
    // Type an invalid expression
    cy.get("textarea").type("invalid@@@");

    // Click the solve button
    cy.get("button").contains("Solve Problem").click();

    // Check if error message is displayed
    cy.contains("Error").should("be.visible");
  });
});

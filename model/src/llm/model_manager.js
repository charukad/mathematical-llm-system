const { pipeline } = require("@xenova/transformers");
const fs = require("fs");
const path = require("path");

class ModelManager {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.modelPath =
      process.env.MODEL_PATH || path.join(__dirname, "models/phi-3-mini");
    this.initialized = false;
    this.useMock = true; // Always use mock for testing
  }

  async initialize() {
    try {
      if (this.initialized) {
        return true;
      }

      console.log("Loading model from", this.modelPath);

      // For testing, always use mock implementation
      if (this.useMock || !fs.existsSync(this.modelPath)) {
        console.log("Using mock model implementation for testing");
        this.model = {
          // Mock implementation that returns pre-defined responses
          generate: async (prompt, options) => {
            // Create a simple mock response based on the prompt
            let response = prompt + "\n\n";

            // Check if prompt contains an equation we can parse
            const equationMatch = prompt.match(
              /(\d+[a-z]\s*[\+\-]\s*\d+\s*\=\s*\d+)/i
            );
            if (equationMatch) {
              const equation = equationMatch[1];

              // Extract parts of a simple linear equation like "2x + 3 = 7"
              const parts = equation.match(
                /(\d+)([a-z])\s*([\+\-])\s*(\d+)\s*\=\s*(\d+)/i
              );

              if (parts) {
                const [_, coef, variable, op, constant, result] = parts;
                const a = parseInt(coef);
                const b = op === "+" ? parseInt(constant) : -parseInt(constant);
                const c = parseInt(result);

                // Solve for x: ax + b = c => x = (c - b) / a
                const solution = (c - b) / a;

                response += `Step 1: Start with the original equation\n${equation}\n\n`;
                response += `Step 2: Move all constants to the right side\n${coef}${variable} = ${result} ${
                  op === "+" ? "-" : "+"
                } ${constant}\n\n`;
                response += `Step 3: Isolate the variable\n${coef}${variable} = ${
                  c - b
                }\n\n`;
                response += `Step 4: Divide both sides by the coefficient\n${variable} = ${solution}\n\n`;
                response += `Final Answer: ${variable} = ${solution}`;
              } else {
                response +=
                  "Step 1: This is a mock step\nCould not parse the equation format\n\nFinal Answer: Mock solution";
              }
            } else {
              response +=
                "Step 1: This is a mock step\nMock mathematical solution\n\nStep 2: Another mock step\nMore mock content\n\nFinal Answer: Mock solution";
            }

            return [
              {
                generated_text: response,
              },
            ];
          },
        };
      } else {
        // Use real model if available and mock is disabled
        console.log("Initializing text-generation pipeline...");
        this.model = await pipeline("text-generation", this.modelPath);
      }

      this.initialized = true;
      console.log("Model initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing model:", error);
      return false;
    }
  }

  async generateText(prompt, options = {}) {
    if (!this.initialized) {
      const success = await this.initialize();
      if (!success) {
        throw new Error("Failed to initialize model");
      }
    }

    // Default generation parameters
    const defaultOptions = {
      max_new_tokens: 256,
      temperature: 0.7,
      top_p: 0.95,
      do_sample: true,
    };

    // Merge with user options
    const genOptions = { ...defaultOptions, ...options };

    try {
      const result = await this.model.generate(prompt, genOptions);
      // Extract just the newly generated text
      const generatedText = result[0].generated_text.substring(prompt.length);
      return generatedText.trim();
    } catch (error) {
      console.error("Error generating text:", error);
      throw new Error(`Text generation failed: ${error.message}`);
    }
  }
}

module.exports = new ModelManager();

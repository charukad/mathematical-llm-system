const { pipeline } = require("@xenova/transformers");
const fs = require("fs");
const path = require("path");

/**
 * Manages the loading and interaction with the LLM model
 */
class ModelManager {
  constructor() {
    this.model = null;
    this.tokenizer = null;
    this.modelPath =
      process.env.MODEL_PATH || path.join(__dirname, "models/phi-3-mini");
    this.initialized = false;
  }

  /**
   * Initializes the model by loading it into memory
   *
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async initialize() {
    try {
      if (this.initialized) {
        return true;
      }

      console.log("Loading model from", this.modelPath);

      // Check if model directory exists
      if (!fs.existsSync(this.modelPath)) {
        console.error(`Model path does not exist: ${this.modelPath}`);
        console.error("Please download the model first using the setup script");
        return false;
      }

      // For testing purposes, we'll skip actual model loading
      // Comment this out when you have a real model to load
      console.log("TESTING MODE: Skipping actual model loading");
      this.model = {
        async generate(prompt, options) {
          return [
            {
              generated_text:
                prompt +
                "\n\nStep 1: This is a mock step\n2x + 3 = 7\n\nStep 2: Move constants to the right side\n2x = 4\n\nStep 3: Divide both sides by 2\nx = 2\n\nFinal Answer: x = 2",
            },
          ];
        },
      };

      /* 
      // Uncomment this when you have a real model
      console.log('Initializing text-generation pipeline...');
      this.model = await pipeline('text-generation', this.modelPath);
      */

      this.initialized = true;
      console.log("Model initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing model:", error);
      return false;
    }
  }

  /**
   * Generates text based on a prompt
   *
   * @param {string} prompt - The input prompt
   * @param {Object} options - Generation options
   * @returns {Promise<string>} The generated text
   */
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

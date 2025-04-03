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

      // Load the pipeline
      console.log("Initializing text-generation pipeline...");
      this.model = await pipeline("text-generation", this.modelPath);

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
      const result = await this.model(prompt, genOptions);
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

const fs = require("fs");
const path = require("path");

// Define the paths to .env.example files and where to create .env files
const envPaths = [
  {
    example: path.join(__dirname, "../model/.env.example"),
    target: path.join(__dirname, "../model/.env"),
  },
  {
    example: path.join(__dirname, "../webapp/server/.env.example"),
    target: path.join(__dirname, "../webapp/server/.env"),
  },
];

// Function to copy .env.example to .env if .env doesn't exist
function createEnvFiles() {
  envPaths.forEach(({ example, target }) => {
    if (fs.existsSync(example) && !fs.existsSync(target)) {
      fs.copyFileSync(example, target);
      console.log(`Created ${target} from example file`);
    } else if (!fs.existsSync(example)) {
      console.error(`Example file ${example} does not exist`);
    } else {
      console.log(`${target} already exists, skipping`);
    }
  });
}

createEnvFiles();

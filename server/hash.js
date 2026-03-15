const bcrypt = require("bcryptjs");

const SALT_ROUNDS = 10;

async function run() {
  const input = process.argv[2];

  if (!input) {
    console.log("Usage: node hash.js <text>");
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hash = await bcrypt.hash(input, salt);

    console.log("Input :", input);
    console.log("Hash  :", hash);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
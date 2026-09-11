// Usage: node scripts/hash-password.mjs "yourPasswordHere"
// Prints a bcrypt hash to paste into LU_PASSWORD_HASH or WIFE_PASSWORD_HASH.
import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hash-password.mjs "yourPasswordHere"');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 12);
console.log(hash);

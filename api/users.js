import express from "express";
const router = express.Router();
export default router;

import bcrypt from "bcrypt";
import { createUser, getUserByUsername } from "#db/queries/users";
import { createToken } from "#utils/jwt";

// POST /users/register
router.post("/register", async (req, res) => {
  if (!req.body) return res.status(400).send("Request body is required.");

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Request body requires: username, password");
  }

  try {
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the user
    const user = await createUser(username, hashedPassword);

    // Create and send token
    const token = createToken({ id: user.id });
    res.status(201).send(token);
  } catch (error) {
    // Handle unique constraint violation for username
    if (error.code === "23505") {
      return res.status(400).send("Username already exists.");
    }
    throw error;
  }
});

// POST /users/login
router.post("/login", async (req, res) => {
  if (!req.body) return res.status(400).send("Request body is required.");

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).send("Request body requires: username, password");
  }

  try {
    // Find user by username
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).send("Invalid credentials.");
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).send("Invalid credentials.");
    }

    // Create and send token
    const token = createToken({ id: user.id });
    res.send(token);
  } catch (error) {
    throw error;
  }
});

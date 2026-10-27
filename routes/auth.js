const express = require("express");
const bcrypt = require("bcryptjs");
const { queryOne, run } = require("../database/db");
const router = express.Router();

function publicUser(user) {
  return { id: user.id, full_name: user.full_name, email: user.email, college_email: user.email, created_at: user.created_at };
}

router.post("/register", async (req, res, next) => {
  try {
    const fullName = typeof req.body.fullName === "string" ? req.body.fullName.trim() : "";
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    if (fullName.length < 2 || fullName.length > 100) return res.status(400).json({ error: "Full name must be between 2 and 100 characters" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return res.status(400).json({ error: "Enter a valid email address" });
    if (password.length < 6 || password.length > 72) return res.status(400).json({ error: "Password must be between 6 and 72 characters" });
    if (queryOne("SELECT id FROM users WHERE email = ?", [email])) return res.status(409).json({ error: "An account with this email already exists" });
    const passwordHash = await bcrypt.hash(password, 12);
    const { lastId } = run("INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)", [fullName, email, passwordHash]);
    const user = queryOne("SELECT id, full_name, email, created_at FROM users WHERE id = ?", [lastId]);
    req.session.userId = user.id;
    res.status(201).json({ user: publicUser(user) });
  } catch (error) { next(error); }
});

router.post("/login", async (req, res, next) => {
  try {
    const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body.password === "string" ? req.body.password : "";
    const user = queryOne("SELECT id, full_name, email, password_hash, created_at FROM users WHERE email = ?", [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) return res.status(401).json({ error: "Invalid email or password" });
    req.session.regenerate(error => {
      if (error) return next(error);
      req.session.userId = user.id;
      res.json({ user: publicUser(user) });
    });
  } catch (error) { next(error); }
});

router.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: "Authentication required" });
  const user = queryOne("SELECT id, full_name, email, created_at FROM users WHERE id = ?", [req.session.userId]);
  if (!user) return res.status(401).json({ error: "Authentication required" });
  res.json({ user: publicUser(user) });
});

router.post("/logout", (req, res, next) => {
  req.session.destroy(error => {
    if (error) return next(error);
    res.clearCookie("lostfound.sid", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
    res.json({ ok: true });
  });
});

module.exports = router;

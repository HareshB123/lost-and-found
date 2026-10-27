const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");
const { initializeDatabase, getDatabase, saveDatabase } = require("./database/db");

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use(session({
  name: "lostfound.sid",
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

app.get("/api/health", (_req, res) => res.json({ ok: true, message: "Lost and Found backend is running" }));
app.get("/api/db-test", (_req, res) => {
  try {
    const rows = getDatabase().exec("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    const tables = rows[0]?.values.map(([name]) => name) || [];
    res.json({ ok: true, tables });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Database unavailable" });
  }
});

app.use("/api/auth", require("./routes/auth"));
app.use("/api/items", require("./routes/items"));
app.use("/api", (_req, res) => res.status(404).json({ error: "API endpoint not found" }));
// The database lives under the project root; never serve it as a static asset.
app.use("/database", (_req, res) => res.sendStatus(404));
app.use(express.static(__dirname));
app.use((err, _req, res, _next) => {
  console.error("Request error:", err);
  res.status(500).json({ error: "Internal server error" });
});

initializeDatabase().then(() => {
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}).catch(error => {
  console.error("Failed to initialize SQLite database:", error);
  process.exitCode = 1;
});

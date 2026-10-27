const express = require("express");
const { queryAll, queryOne, run } = require("../database/db");
const router = express.Router();
const FALLBACK_IMAGES = {
  lost: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80",
  found: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
};

function requireAuth(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: "Authentication required" });
  next();
}
function mapItem(row) {
  return { ...row, item_name: row.title, report_type: row.item_type, date_lost_or_found: row.item_date, status: row.status === "active" ? "Active" : "Resolved", image_urls: [row.image_url || FALLBACK_IMAGES[row.item_type]], user_name: row.full_name, college_email: row.email };
}

router.get("/", (req, res) => {
  const type = req.query.type;
  if (type && !["lost", "found"].includes(type)) return res.status(400).json({ error: "type must be lost or found" });
  let rows = queryAll("SELECT r.*, u.full_name FROM item_reports r JOIN users u ON u.id = r.user_id WHERE r.status = 'active' ORDER BY r.created_at DESC, r.id DESC");
  if (type) rows = rows.filter(row => row.item_type === type);
  res.json({ items: rows.map(mapItem) });
});

router.get("/mine", requireAuth, (req, res) => {
  const rows = queryAll("SELECT r.*, u.full_name FROM item_reports r JOIN users u ON u.id = r.user_id WHERE r.user_id = ? ORDER BY r.created_at DESC, r.id DESC", [req.session.userId]);
  res.json({ items: rows.map(mapItem) });
});

router.post("/", requireAuth, (req, res) => {
  const body = req.body || {};
  const title = typeof (body.title ?? body.item_name) === "string" ? (body.title ?? body.item_name).trim() : "";
  const itemType = body.item_type ?? body.report_type;
  const category = typeof body.category === "string" ? body.category.trim() : "";
  const description = typeof body.description === "string" ? body.description.trim() : "";
  const location = typeof body.location === "string" ? body.location.trim() : "";
  const itemDate = body.item_date ?? body.date_lost_or_found;
  const imageUrl = typeof body.image_url === "string" ? body.image_url : null;
  const approximateTime = typeof body.approximate_time === "string" ? body.approximate_time : null;
  const custodyStatus = typeof body.custody_status === "string" ? body.custody_status.trim() : null;
  if (title.length < 2 || title.length > 160) return res.status(400).json({ error: "Title must be between 2 and 160 characters" });
  if (!["lost", "found"].includes(itemType)) return res.status(400).json({ error: "item_type must be lost or found" });
  if (!category || category.length > 80) return res.status(400).json({ error: "A valid category is required" });
  if (description.length < 5 || description.length > 4000) return res.status(400).json({ error: "Description must be between 5 and 4000 characters" });
  if (!location || location.length > 160) return res.status(400).json({ error: "A valid location is required" });
  if (typeof itemDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(itemDate) || Number.isNaN(Date.parse(`${itemDate}T00:00:00Z`)) || new Date(`${itemDate}T00:00:00Z`).toISOString().slice(0, 10) !== itemDate) return res.status(400).json({ error: "item_date must be a valid date in YYYY-MM-DD format" });
  if (imageUrl && imageUrl.length > 7_500_000) return res.status(400).json({ error: "Image is too large" });
  if (imageUrl && !/^https:\/\/[^\s<>"']+$/i.test(imageUrl) && !/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(imageUrl)) return res.status(400).json({ error: "image_url must be an HTTPS URL or supported image upload" });
  if (approximateTime && !/^([01]\d|2[0-3]):[0-5]\d$/.test(approximateTime)) return res.status(400).json({ error: "approximate_time must use HH:MM format" });
  if (custodyStatus && custodyStatus.length > 200) return res.status(400).json({ error: "custody_status is too long" });
  const { lastId } = run("INSERT INTO item_reports (user_id, title, item_type, category, description, location, item_date, image_url, approximate_time, custody_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", [req.session.userId, title, itemType, category, description, location, itemDate, imageUrl, approximateTime, itemType === "found" ? custodyStatus : null]);
  const item = queryOne("SELECT r.*, u.full_name FROM item_reports r JOIN users u ON u.id = r.user_id WHERE r.id = ?", [lastId]);
  res.status(201).json({ item: mapItem(item) });
});

router.patch("/:id/resolve", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid report id" });
  const item = queryOne("SELECT id, user_id, status FROM item_reports WHERE id = ?", [id]);
  if (!item) return res.status(404).json({ error: "Report not found" });
  if (item.user_id !== req.session.userId) return res.status(403).json({ error: "You can only resolve your own reports" });
  if (item.status !== "resolved") run("UPDATE item_reports SET status = 'resolved' WHERE id = ? AND user_id = ?", [id, req.session.userId]);
  res.json({ ok: true, status: "resolved" });
});

router.delete("/:id", requireAuth, (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: "Invalid report id" });
  const item = queryOne("SELECT id, user_id FROM item_reports WHERE id = ?", [id]);
  if (!item) return res.status(404).json({ error: "Report not found" });
  if (item.user_id !== req.session.userId) return res.status(403).json({ error: "You can only delete your own reports" });
  run("DELETE FROM item_reports WHERE id = ? AND user_id = ?", [id, req.session.userId]);
  res.json({ ok: true });
});

module.exports = router;

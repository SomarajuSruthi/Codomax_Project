const crypto = require("crypto");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = path.join(__dirname, "data.json");
const TOKEN_SECRET = process.env.TOKEN_SECRET || "change-this-secret-before-production";
app.use(cors());
app.use(express.json());

function readData() {
    if (!fs.existsSync(DATA_FILE)) return { users: [], blogs: [] };
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}
function writeData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)); }
function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
    return `${salt}:${crypto.scryptSync(password, salt, 64).toString("hex")}`;
}
function passwordMatches(password, stored) {
    const [salt, storedHash] = stored.split(":");
    const candidate = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(storedHash, "hex"), Buffer.from(candidate, "hex"));
}
function createToken(user) {
    const payload = Buffer.from(JSON.stringify({ id: user.id, email: user.email })).toString("base64url");
    return `${payload}.${crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url")}`;
}
function requireAuth(req, res, next) {
    const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ success: false, message: "Authentication is required." });
    const [payload, signature] = token.split(".");
    if (!payload || !signature) return res.status(401).json({ success: false, message: "Invalid authentication token." });
    const expected = crypto.createHmac("sha256", TOKEN_SECRET).update(payload).digest("base64url");
    if (signature.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return res.status(401).json({ success: false, message: "Invalid authentication token." });
    try { req.user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); next(); }
    catch { res.status(401).json({ success: false, message: "Invalid authentication token." }); }
}

app.get("/", (req, res) => res.sendFile(path.join(__dirname, "../frontend/login.html")));
app.get("/home", (req, res) => res.sendFile(path.join(__dirname, "../frontend/index.html")));
app.use(express.static(path.join(__dirname, "../frontend")));
app.get("/api/health", (req, res) => res.json({ success: true, message: "Steppi API is running." }));

app.post("/api/users/register", (req, res) => {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "Name, email, and password are required." });
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ success: false, message: "Enter a valid email address." });
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must contain at least 6 characters." });
    const data = readData();
    if (data.users.some((user) => user.email === email)) return res.status(409).json({ success: false, message: "An account with this email already exists." });
    const user = { id: crypto.randomUUID(), name, email, password: hashPassword(password), createdAt: new Date().toISOString() };
    data.users.push(user); writeData(data);
    res.status(201).json({ success: true, message: "Registration successful. Please log in.", user: { id: user.id, name, email } });
});

app.post("/api/users/login", (req, res) => {
    const email = req.body.email?.trim().toLowerCase();
    const { password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required." });
    const user = readData().users.find((item) => item.email === email);
    if (!user || !passwordMatches(password, user.password)) return res.status(401).json({ success: false, message: "Invalid email or password." });
    res.json({ success: true, message: "Login successful.", token: createToken(user), user: { id: user.id, name: user.name, email: user.email } });
});

app.post("/api/blogs", requireAuth, (req, res) => {
    const title = req.body.title?.trim();
    const content = req.body.content?.trim();
    if (!title || !content) return res.status(400).json({ success: false, message: "Blog title and content are required." });
    const data = readData();
    const blog = { id: crypto.randomUUID(), title, content, authorId: req.user.id, authorEmail: req.user.email, createdAt: new Date().toISOString() };
    data.blogs.unshift(blog); writeData(data);
    res.status(201).json({ success: true, message: "Blog created successfully.", blog });
});
app.get("/api/blogs", (req, res) => res.json({ success: true, blogs: readData().blogs }));
app.use((req, res) => res.status(404).json({ success: false, message: "Route not found." }));
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

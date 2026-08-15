const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());


 
// FIRST PAGE → LOGIN PAGE
 

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/login.html"));
});


 
// HOME PAGE → INDEX.HTML
 

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});


 
// SERVE CSS, JS, IMAGES, HTML FILES
 

app.use(express.static(path.join(__dirname, "../frontend")));



// LOGIN API


app.post("/api/users/login", (req, res) => {

    const { email, password } = req.body;

    console.log("Email:", email);
    console.log("Password:", password);

    if (email && password) {

        res.json({
            success: true,
            message: "Login successful"
        });

    } else {

        res.json({
            success: false,
            message: "Email and password are required"
        });

    }
});


 
// START SERVER
 

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
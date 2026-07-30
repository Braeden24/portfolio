/*
Names: Braeden Carlson, Lynda Ofurie, Justin Day
Date: 10/20/2025
Purpose: Advising Website Server Script
Filename: server.js
*/


const express = require("express");
const cors = require("cors");
const db = require("./database/db.js");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Test database connection
db.getConnection((err, connection) => {
	if (err) {
		console.error("Database connection failed:", err);
	} else {
		console.log("Connected to MySQL!");
		connection.release();
	}
});

app.use(session({
	secret: "tempKey",
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

// Login endpoint
app.post("/api/login", (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) return res.status(400).json({ error: "Missing credentials" });

	const query = "SELECT * FROM users WHERE username = ?";
	db.query(query, [username], async (err, results) => {
		if (err) return res.status(500).json({ error: err.message });
		if (results.length === 0) return res.status(401).json({ error: "Invalid username or password" });

    const teacher = results[0];
    const passwordHash = teacher.password_hash;

    // compare password hashes (if stored using SHA2 in MySQL)
    const crypto = require("crypto");
    const hashedInput = crypto.createHash("sha256").update(password).digest("hex");

    if (hashedInput === passwordHash) {
		req.session.user = { id: teacher.id, username: teacher.username };
		return res.json({ message: "Login successful", user: req.session.user });
    } else {
		return res.status(401).json({ error: "Invalid username or password" });
    }
	});
});

// Logout route
app.post("/api/logout", (req, res) => {
	req.session.destroy();
	res.json({ message: "Logged out" });
});

function requireLogin(req, res, next) {
  if (!req.session.user) {
	return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/classes", requireLogin, (req, res) => {
	const query = "SELECT * FROM classinfo";
	db.query(query, (err, results) => {
    if (err) {
		return res.status(500).json({ error: err.message });
    }
    res.json(results);
	});
});

// Get the student list
app.get("/api/students", requireLogin, (req, res) => {
	const query = "SELECT * FROM studentinfo";
	db.query(query, (err, results) => {
    if (err) {
		return res.status(500).json({ error: err.message });
    }
    res.json(results);
	});
});

app.get("/api/student/:starID", requireLogin, (req, res) => {
    const query = "SELECT * FROM studentinfo WHERE starID = ?";
    db.query(query, [req.params.starID], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(404).json({ error: "Student not found" });

        res.json(results[0]);
    });
});


app.post("/api/saveStudent", requireLogin, (req, res) => {
    const { starID, FirstName, LastName, areaOfEmphasis, Classes, Notes } = req.body;

    if (!starID) return res.status(400).json({ error: "Missing starID" });

    const query = `
        INSERT INTO studentinfo (starID, LastName, FirstName, areaOfEmphasis, Classes, Notes) 
        VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            LastName = VALUES(LastName),
            FirstName = VALUES(FirstName),
            areaOfEmphasis = VALUES(areaOfEmphasis),
            Classes = VALUES(Classes),
            Notes = VALUES(Notes)
    `;

    db.query(query, [
        starID,
        LastName,
        FirstName,
        areaOfEmphasis,
        Classes,
        Notes
    ], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Student saved successfully!" });
    });
});


app.listen(3000, () => console.log("Server running on port 3000"));

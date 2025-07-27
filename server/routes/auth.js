const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db/connection');

const router = express.Router();

router.post('/register', async (req, res) => {
    const { username, password, email } = req.body;

    // validate input
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required." })
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const sql = "insert into users (username, password, email) values (?,?,?)";

        db.query(sql, [username, hashedPassword, email], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: "Username Already Exists..." });
                }
                return res.status(500).json({ message: "Database Error", error: err });
            }
            res.status(201).json({ message: "User registered successfully", userId: result.insertId });
        });
    }
    catch (error) {
        res.status(500).json({ message: "Server error - ", error });
    }
});

router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // basic validation -> empty username or password field
    if (!username || !password) {
        return res.status(400).json({ message: "username and password are requried." });
    }

    // cheking that user is exists or not
    const sql = "select * from users where username=?";
    db.query(sql, [username], async (err, result) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        // invalid username
        if (result.length == 0) return res.status(404).json({ message: "Invalid Username or Password" });

        const user = result[0];

        // compare password
        const isMatch = await bcrypt.compare(password, user.password);

        // invalid password
        if (!isMatch) return res.status(401).json({ message: "Invalid Username or Password" });

        // Generating JWT token
        const jwt = require('jsonwebtoken');
        // Generated on the basis of user id, secret key from .env, token valid for 1 hour
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            message: "Login successful",
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

        /*

            1. User logs in by sending username and password to the server.

            2. If login is successful, the server generates a JWT token using the user ID.

            3. This token is sent back to the frontend (React).

            4. The frontend stores the token — either in:

                localStorage (common in React apps)
                or Cookies (if you're using them explicitly)

            5. The token has an expiration time (e.g., 1 hour), set like this:

                jwt.sign(payload, secret, { expiresIn: '1h' })
            
            6. Every time the user makes a secure request (like /balance, /transfer), the frontend sends this token in the HTTP header:

                Authorization: Bearer <token>
            
            7. On the backend, you verify the token using:

                jwt.verify(token, secret)
            
                If the token is valid → allow the request
                If invalid or expired → reject with “Unauthorized” message

            8. After the token expires (e.g. 1 hour), the user must log in again to get a new token
        */
    });
});

module.exports = router;
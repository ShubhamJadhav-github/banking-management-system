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

module.exports = router;
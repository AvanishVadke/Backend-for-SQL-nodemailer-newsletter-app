require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// Create a connection pool to fix connection error
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Successfully connected to MySQL database!");
    connection.release(); // Always release the connection when done testing
});

// Convert pool to use promises
const promisePool = pool.promise();

// Email config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS 
    }
});

// Add this new endpoint to your Express server
app.post('/check-status', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const [rows] = await promisePool.query(
            "SELECT * FROM subscribers WHERE email = ?",
            [email]
        );
        
        return res.json({ isSubscribed: rows.length > 0 });
    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ error: "Database error" });
    }
});

app.post('/subscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        // Check if email exists
        const [existingUsers] = await promisePool.query(
            "SELECT * FROM subscribers WHERE email = ?",
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({ message: "Email is already subscribed!" });
        }

        // Insert new subscriber
        const [result] = await promisePool.query(
            "INSERT INTO subscribers (email) VALUES (?)",
            [email]
        );

        console.log("Inserted: ", result);

        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Newsletter Subscription',
            text: "You have successfully subscribed to our newsletter!\n\nYou will receive all the latest updates and offers from us."
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return res.status(200).json({ message: "Subscription successful! Confirmation email sent." });

    } catch (error) {
        console.error("Error:", error);
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ error: "Database connection failed" });
        }
        return res.status(500).json({ error: "An error occurred" });
    }
});

app.delete('/unsubscribe', async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    try {
        const [result] = await promisePool.query(
            "DELETE FROM subscribers WHERE email = ?",
            [email]
        );

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Email not found in the subscription list!" });
        }

        console.log("Deleted: ", result);

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Newsletter Unsubscription',
            text: "You have successfully unsubscribed from our newsletter.\n\nIf you want to subscribe again, please visit our website."
        };

        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully");
        return res.status(200).json({ message: "Unsubscription successful! Confirmation email sent." });

    } catch (error) {
        console.error("Error:", error);
        if (error.code === 'ECONNREFUSED') {
            return res.status(500).json({ error: "Database connection failed" });
        }
        return res.status(500).json({ error: "An error occurred" });
    }
});

app.listen(9000, () => {
    console.log("Listening at port 9000");
});

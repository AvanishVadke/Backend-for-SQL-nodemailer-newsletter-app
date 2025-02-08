const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const mysql = require("mysql2");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const con = mysql.createConnection({
    host: "sql12.freesqldatabase.com",
    port: 3306,
    user: "sql12761740",
    password: "rw3HwA9MBh",
    database: "sql12761740"
});

con.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to MySQL database!");
});

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: "avanishvadke001@gmail.com",
        pass: "xxwhcorsucjfbhtt"  // Make sure this is an App Password from Google
    }
});

app.post('/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    let checkSql = "SELECT * FROM subscribers WHERE email = ?";

    con.query(checkSql, [email], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Email is already subscribed!" });
        } 

        let insertSql = "INSERT INTO subscribers (email) VALUES (?)";
        con.query(insertSql, [email], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: "Database error" });
            }

            console.log("Inserted: ", result);

            let mailOptions = {
                from: "avanishvadke001@gmail.com",
                to: email,
                subject: 'Newsletter Subscription',
                text: "You have successfully subscribed to our newsletter!\n\nYou will receive all the latest updates and offers from us."
            };

            transporter.sendMail(mailOptions, (err, info) => {
                if (err) {
                    console.log("Error occurred: ", err);
                    return res.status(500).json({ error: "Failed to send email" });
                }
                console.log("Email sent: ", info.response);
                return res.status(200).json({ message: "Subscription successful! Confirmation email sent." });
            });
        });
    });
});

app.delete('/unsubscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }

    let sql = "DELETE FROM subscribers WHERE email = ?";

    con.query(sql, [email], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: "Email not found in the subscription list!" });
        }

        console.log("Deleted: ", result);

        let mailOptions = {
            from: "avanishvadke001@gmail.com",
            to: email,
            subject: 'Newsletter Unsubscription',
            text: "You have successfully unsubscribed from our newsletter.\n\nIf you want to subscribe again, please visit our website."
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log("Error occurred: ", err);
                return res.status(500).json({ error: "Failed to send email" });
            }
            console.log("Email sent: ", info.response);
            return res.status(200).json({ message: "Unsubscription successful! Confirmation email sent." });
        });
    });
});

app.listen(9000, () => {
    console.log("Listening at port 9000");
});
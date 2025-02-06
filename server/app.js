require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
require("./db/conn");
const PORT = 6005;
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;
const userdb = require("./model/userSchema");
const twilio = require('twilio');
const nodemailer = require("nodemailer");
const useragent = require('express-useragent');
const requestIp = require('request-ip');



app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

// Setup session
app.use(session({
    secret: 'b7a3f8e1c2d5a6f9e0b4c7d8e2f1a3b5c6d9e0f2b4a7c8d1e3f6a9b0c2d5e7',
    resave: false,
    saveUninitialized: true
}));

// Setup passport
app.use(passport.initialize());
app.use(passport.session());

app.use(useragent.express());
app.use((req, res, next) => {
    req.clientIp = requestIp.getClientIp(req);
    next();
});

passport.use(
    new OAuth2Strategy({
        clientID: clientid,
        clientSecret: clientsecret,
        callbackURL: "/auth/google/callback",
        scope: ["profile", "email"]
    },
    async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await userdb.findOne({ email: profile.emails[0].value });

            if (user) {
                if (!user.googleId) {
                    user.googleId = profile.id;
                    user.displayName = profile.displayName;
                    user.image = profile.photos[0].value;
                    await user.save();
                }
            } else {
                user = new userdb({
                    googleId: profile.id,
                    displayName: profile.displayName,
                    email: profile.emails[0].value,
                    image: profile.photos[0].value
                });
                await user.save();
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    })
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});

// Initial Google OAuth login
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get("/auth/google/callback", passport.authenticate("google", {
    successRedirect: "http://localhost:3000/dashboard",
    failureRedirect: "http://localhost:3000/login"
}));

app.get("/login/success", async (req, res) => {
    if (req.user) {
        res.status(200).json({ message: "user Login", user: req.user });
    } else {
        res.status(400).json({ message: "Not Authorized" });
    }
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        req.session.destroy(() => {
            res.clearCookie('connect.sid');
            res.redirect("http://localhost:3000");
        });
    });
});

app.post("/signup", async (req, res) => {
    const { username, email, phone, password } = req.body;
    console.log("Sign-up data:", { username, email, phone, password });

    if (!username || !email || !phone || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const existingUser = await userdb.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const newUser = new userdb({
            displayName: username,
            email,
            phone,
            password,
        });

        await newUser.save();
        res.status(201).json({ success: true, message: "User created successfully." });
    } catch (error) {
        console.error("Error signing up:", error);
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

app.post('/login', async (req, res) => {
    const { identifier, password } = req.body;

    try {
        const user = await userdb.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found." });
        }

        if (user.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid credentials." });
        }

        const loginInfo = {
            browser: req.useragent.browser || 'Unknown',
            os: req.useragent.os || 'Unknown',
            device: req.useragent.isMobile ? 'Mobile' : 'Desktop',
            ip: req.clientIp || 'Unknown',
            timestamp: new Date()
        };
        console.log("Login Info:", loginInfo);

        user.loginHistory = user.loginHistory || [];
        user.loginHistory.push(loginInfo);
        await user.save();

        res.status(200).json({ success: true, message: "Login successful.", displayName: user.displayName });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ success: false, message: "Internal server error." });
    }
});

// Configure Twilio
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/forgot-password', async (req, res) => {
    const { identifier } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const user = await userdb.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        const now = new Date();
        if (user.lastOtpRequest && (now - user.lastOtpRequest) < 24 * 60 * 60 * 1000) {
            return res.status(400).json({ message: 'You can request an OTP only once per day.' });
        }

        user.otp = otp;
        user.lastOtpRequest = now;
        await user.save();

        if (identifier.includes('@')) {
            console.log(`Sending OTP to email: ${identifier}`);
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: identifier,
                subject: 'Password Reset OTP',
                html: `<p>Your OTP is <strong>${otp}</strong></p>`
            });
        } else {
            const formattedPhoneNumber = identifier.startsWith('+') ? identifier : `+${identifier}`;
            if (!/^\+\d{10,15}$/.test(formattedPhoneNumber)) {
                return res.status(400).json({ message: 'Invalid phone number format' });
            }
            console.log(`Sending OTP to phone: ${formattedPhoneNumber}`);
            await twilioClient.messages.create({
                body: `Your OTP is ${otp}`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhoneNumber
            });
        }
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error("Error sending OTP:", error);
        res.status(500).json({ message: 'Failed to send OTP' });
    }
});

app.post('/verify-otp', async (req, res) => {
    const { identifier, otp } = req.body;

    try {
        const user = await userdb.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user || user.otp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP.' });
        }

        user.otp = null;
        await user.save();

        res.status(200).json({ message: 'OTP verified.' });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ message: 'Failed to verify OTP.' });
    }
});

app.post('/update-password', async (req, res) => {
    const { identifier, newPassword } = req.body;

    try {
        const user = await userdb.findOne({
            $or: [
                { email: identifier },
                { phone: identifier }
            ]
        });

        if (!user) {
            return res.status(400).json({ message: 'User not found.' });
        }

        user.password = newPassword;
        await user.save();

        res.status(200).json({ message: 'Password updated successfully.' });
        res.redirect("http://localhost:3000/login");
        console.log("Password updated successfully.");
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: 'Failed to update password.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
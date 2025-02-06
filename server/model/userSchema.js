const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    googleId: String,
    displayName: String,
    email: String,
    image: String,
    phone: String,
    password: String,
    lastOtpRequest: Date,
    otp: String,
    loginHistory: [{
        browser: String,
        os: String,
        device: String,
        ip: String,
        timestamp: Date
    }]
}, { timestamps: true });

const userdb = new mongoose.model("users", userSchema);

module.exports = userdb;
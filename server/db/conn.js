const mongoose = require("mongoose");

// Use environment variable for DB connection string
const DB = process.env.MONGODB_URI || "mongodb+srv://punitt29870:aVPBxWhSKcU3tkHF@cluster0.71apg.mongodb.net/GoogleLogin?retryWrites=true&w=majority";

const connectDB = async () => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            family: 4
        });
        
        console.log("Database connected successfully");

       
    } catch (error) {
        console.error("Error connecting to database:", error);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

// Initial connection
connectDB();

// Handle process termination
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error closing MongoDB connection:', err);
        process.exit(1);
    }
});

module.exports = mongoose.connection;
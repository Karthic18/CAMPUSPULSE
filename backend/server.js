const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({
    path: path.join(__dirname, ".env")
});

const app = express();


const PORT = process.env.PORT || 5000;

// =========================================
// MIDDLEWARE
// =========================================

app.use(cors());
app.use(express.json());

// =========================================
// ROUTES
// =========================================

const feedbackRoutes = require("./routes/feedbackRoutes");

app.use("/api/feedback", feedbackRoutes);

// =========================================
// MONGODB CONNECTION
// =========================================

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("❌ MongoDB connection failed:");
        console.error(error.message);
    });

// =========================================
// BASIC TEST ROUTE
// =========================================

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "CampusPulse API is running 🚀",
        database:
            mongoose.connection.readyState === 1
                ? "Connected"
                : "Not Connected"
    });
});

// =========================================
// SERVER
// =========================================

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════╗
║          CAMPUSPULSE API             ║
║                                      ║
║  Server: http://localhost:${PORT}    ║
║                                      ║
╚══════════════════════════════════════╝
`);
});